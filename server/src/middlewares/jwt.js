import jwt from 'jsonwebtoken'
import { AuthFailureError, BadRequestError, ForbiddenError, NotFoundError } from '../core/error.response.js'
import { decrypt } from '../configs/encryption.config.js'
import { User } from '../models/user.model.js'
import Character from '../models/character.model.js'

export const verifyToken = (req, res, next) => {
    let token

    const authHeader = req.headers.authorization

    // 1. Get token from Authorization header (MOBILE)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1] // ❌ NO decryption here
    } else if (req.cookies?.accessToken) {
        // 2. Or get token from cookies (WEB)
        token = decrypt(req.cookies.accessToken) // ✅ Only decrypt cookies
    } else {
        return next(new AuthFailureError('Please login to continue'))
    }

    // 3. Verify token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.id
        req.email = payload.email
        next()
    } catch (err) {
        console.error('❌ Invalid token:', err.message)
        return next(new BadRequestError('Invalid token, please login again'))
    }
}

export const verifyCharacterOwnership = async (req, res, next) => {
    const userId = req.userId

    // 1. Try to find characterId from various sources
    const characterId = req.body.characterId || req.params.characterId

    if (!characterId) {
        return next(new BadRequestError('Character ID is required for this operation'))
    }

    try {
        // 2. Find the character and verify ownership
        const character = await Character.findById(characterId).select('userId')
        if (!character) {
            return next(new NotFoundError('Character not found'))
        }

        if (character.userId.toString() !== userId.toString()) {
            return next(new ForbiddenError('You are not authorized to edit this character'))
        }

        // 3. Continue if ownership is valid
        next()
    } catch (error) {
        console.error('❌ verifyCharacterOwnership failed:', error.message)
        return next(new BadRequestError('Error verifying character ownership'))
    }
}

export const getUserFromToken = async (req) => {
    try {
        let token = req.cookies?.accessToken
        if (!token) return { user: null, userId: null }

        // Decrypt token
        token = decrypt(token)

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const userId = payload.id.toString()

        // Fetch user from database (optional)
        const user = await User.findById(userId).select('role')
        if (!user) return { user: null, userId }

        return { user, userId }
    } catch (error) {
        console.error('❌ Token verification failed:', error.message)
        return { user: null, userId: null }
    }
}
