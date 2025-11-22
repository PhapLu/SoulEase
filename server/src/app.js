import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import mongoose from 'mongoose'

import router from './routes/index.js'
import configureSocket from './configs/socket.config.js'
import SocketServices from './services/socket.service.js'

// Optional custom input sanitizer
// import sanitizeInputs from "./middlewares/sanitize.middleware.js";

// Connect MongoDB
import './db/init.mongodb.js'

const app = express()

/* ------------------------ Basic Security ------------------------ */
app.disable('x-powered-by')
app.use(
    helmet({
        contentSecurityPolicy: false, // disable CSP → easier during dev
    })
)

/* ------------------------ CORS (simple, clean) ------------------------ */
app.use(
    cors({
        origin: true, // allow any frontend
        credentials: true,
    })
)

/* ------------------------ Parsers & Utilities ------------------------ */
app.use(express.json({ limit: '500kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compression())
// app.use(sanitizeInputs);

/* ------------------------ Logger ------------------------ */
app.use(morgan('dev'))

/* ------------------------ Passport ------------------------ */
app.use(passport.initialize())
import './configs/passport.config.js'

/* ------------------------ Routes ------------------------ */
app.use('/', router)

/* ------------------------ 404 Handler ------------------------ */
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    })
})

/* ------------------------ Error Handler ------------------------ */
app.use((err, req, res, _next) => {
    console.error('Error:', err.message)

    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    })
})

/* ------------------------ HTTP + WebSocket ------------------------ */
const server = http.createServer(app)
const io = configureSocket(server)
io.on('connection', SocketServices.connection)

/* ------------------------ Graceful Shutdown ------------------------ */
process.on('SIGINT', async () => {
    console.log('Shutting down...')
    await mongoose.connection.close()
    server.close(() => process.exit(0))
})

/* ------------------------ Export ------------------------ */
export default server
