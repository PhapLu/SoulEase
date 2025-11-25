import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const IV_LENGTH = parseInt(process.env.IV_LENGTH, 10)

export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
}

export const decrypt = (encryptedText) => {
    const [iv, content] = encryptedText.split(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(content, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

// ✅ Deterministic encryption so the same input => the same ciphertext
export const encryptDeterministic = (text) => {
    const ivSeed = crypto
        .createHmac('sha256', Buffer.from(ENCRYPTION_KEY))
        .update(String(text || ''))
        .digest()
    const iv = ivSeed.subarray(0, IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(String(text || ''), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
}
