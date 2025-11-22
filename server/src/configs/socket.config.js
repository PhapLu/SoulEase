import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'socket.io'

export default function configureSocket(server) {
    const allowedOrigins = [
        process.env.CLIENT_LOCAL_ORIGIN, // Local development frontend
        process.env.CLIENT_ORIGIN, // Production frontend
    ]

    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true)
                } else {
                    callback(new Error(`Socket.IO CORS policy does not allow access from ${origin}`))
                }
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    })

    // Global variable for accessing io instance globally
    global._io = io

    return io
}
