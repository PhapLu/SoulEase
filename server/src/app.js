import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import http from 'http'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { v4 as uuidv4 } from 'uuid'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import mongoose from 'mongoose'

import router from './routes/index.js'
import configureSocket from './configs/socket.config.js'
import SocketServices from './services/socket.service.js'
import sanitizeInputs from './middlewares/sanitize.middleware.js'
import { globalLimiter, blockChecker } from './configs/rateLimit.config.js'
// import './configs/passport.config.js'
// import './configs/cronJob.config.js'

// Init DBs/caches (no Redis store for session; keep your own ioredis init if needed)
import './db/init.mongodb.js'
import { init as initIoRedis } from './db/init.ioredis.js'
import myLoggerLog from './loggers/myLogger.log.js'
initIoRedis({ IOREDIS_IS_ENABLED: false })

const app = express()

/* ---------- App & Security Defaults ---------- */
app.set('trust proxy', 1)
app.disable('x-powered-by')

/* ---------- Allowed Origins (normalize) ---------- */
const toOrigin = (v) => (v && !/^https?:\/\//.test(v) ? `https://${v}` : v)

const allowedOrigins = [
    toOrigin(process.env.CLIENT_LOCAL_ORIGIN), // Local Dev FE
    toOrigin(process.env.CLIENT_ORIGIN), // Prod FE
    toOrigin(process.env.AWS_CLOUDFRONT_DOMAIN),
].filter(Boolean)

/* ---------- CORS (before rate limits) ---------- */
app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
            return cb(new Error(`CORS blocked for ${origin}`))
        },
        methods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Request-Id'],
        credentials: true,
    })
)
// Ensure preflights pass quickly
// app.options('*', cors())

/* ---------- Helmet (hardened defaults) ---------- */
app.use(
    helmet({
        contentSecurityPolicy: process.env.DISABLE_CSP
            ? false
            : {
                  useDefaults: true,
                  directives: {
                      'script-src': ["'self'"],
                      'frame-ancestors': ["'none'"],
                  },
              },
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-site' },
        hsts: process.env.NODE_ENV === 'production' ? { maxAge: 15552000, includeSubDomains: true, preload: false } : false,
    })
)

/* ---------- Parsers & Utilities ---------- */
app.use(express.json({ limit: '200kb' }))
app.use(express.urlencoded({ extended: true, limit: '200kb' }))
app.use(cookieParser())
app.use(compression())
app.use(sanitizeInputs)

/* ---------- Request ID + Logging ---------- */
app.use((req, _res, next) => {
    req.requestId = req.headers['x-request-id'] || uuidv4()
    next()
})
morgan.token('rid', (req) => req.requestId)
app.use(morgan(':method :url :status :response-time ms rid=:rid'))

app.use((req, _res, next) => {
    myLoggerLog.log(`input-params ::${req.method}::`, [req.path, { requestId: req.requestId }, req.method === 'POST' || req.method === 'PATCH' ? req.body : req.query])
    next()
})

/* ---------- Rate Limiters (after CORS) ---------- */
app.use(blockChecker)
// If your limiter throttles OPTIONS, short-circuit it:
app.use((req, res, next) => (req.method === 'OPTIONS' ? res.sendStatus(204) : next()))
app.use(globalLimiter)

/* ---------- Sessions (MemoryStore; OK for dev/small apps) ---------- */
/* NOTE: MemoryStore isn't for production scale. You asked to omit Redis. */
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    })
)

/* ---------- Routes ---------- */
app.use('', router)

/* ---------- 404 & Error Handling ---------- */
app.use((req, _res, next) => {
    const error = new Error('Not Found Route')
    error.status = 404
    next(error)
})

app.use((error, req, res, _next) => {
    const statusCode = error.status || 500

    myLoggerLog.error('handler-error', [req.path, { requestId: req.requestId }, { status: statusCode, message: error.message }])

    // ✅ Only hide message for REAL 500 errors
    const message = process.env.NODE_ENV === 'production' && statusCode >= 500 ? 'Internal Server Error' : error.message || 'Internal Server Error'

    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message,
    })
})

/* ---------- Server & Sockets ---------- */
const server = http.createServer(app)
const io = configureSocket(server)
global._io.on('connection', SocketServices.connection)

/* ---------- Shutdown & Process Events ---------- */
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
})

process.on('SIGINT', async () => {
    console.log('SIGINT: closing…')
    try {
        if (global._io) await global._io.close()
    } catch (e) {
        console.error('Socket close error:', e?.message)
    }
    try {
        await mongoose.connection.close()
    } catch (e) {
        console.error('Mongo close error:', e?.message)
    }
    server.close(() => {
        console.log('HTTP server closed.')
        process.exit(0)
    })
})

export default server
