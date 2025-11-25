import { encrypt, decrypt } from '../configs/encryption.config.js'

const sensitiveFields = [
    // 'taxCodeAddress',
    // 'taxCode',
    // 'cccd',
    'bankDisburse.bankAccountNo',
    'bankDisburse.bankAccountHolderName',
    'bankDisburse.bankCode',
    'pinCode',
    'accessToken',
]

const maskSensitiveValue = (value) => {
    if (!value || typeof value !== 'string') return value
    if (value.length <= 3) return '*'.repeat(value.length)
    // ✅ Keep first 3 characters, mask the rest
    return value.slice(0, 3) + '*'.repeat(value.length - 3)
}

const sensitiveFieldsForEncryption = ['bankDisburse.bankAccountNo', 'bankDisburse.bankAccountHolderName', 'bankDisburse.bankCode', 'pinCode', 'accessToken']

const sensitiveFieldsForDecryption = [
    'bankDisburse.bankAccountNo',
    'bankDisburse.bankAccountHolderName',
    'bankDisburse.bankCode',
    'paypalEmail',
    'accessToken', // pinCode intentionally excluded
]

const sensitiveMaskedFields = ['bankDisburse.bankAccountNo', 'bankDisburse.bankAccountHolderName', 'bankDisburse.bankCode', 'paypalEmail']

export const encryptSensitiveFields = (data) => {
    sensitiveFieldsForEncryption.forEach((field) => {
        const fieldParts = field.split('.')
        if (fieldParts.length === 2) {
            const [parent, child] = fieldParts
            if (data[parent] && data[parent][child] && typeof data[parent][child] === 'string') {
                data[parent][child] = encrypt(data[parent][child])
            }
        } else if (data[field] && typeof data[field] === 'string') {
            data[field] = encrypt(data[field])
        }
    })
    return data
}

const visitedObjects = new WeakSet()

const decryptNestedField = (data, fieldPath) => {
    const pathParts = fieldPath.split('.')
    let obj = data

    for (let i = 0; i < pathParts.length - 1; i++) {
        obj = obj[pathParts[i]]
        if (!obj) return // stop if path broken
    }

    const finalKey = pathParts[pathParts.length - 1]

    if (obj[finalKey] && typeof obj[finalKey] === 'string') {
        if (obj[finalKey].includes(':')) {
            // decrypt only if contains IV
            try {
                let decryptedValue = decrypt(obj[finalKey])

                // ✅ Apply masking if this field is in the masked list
                if (sensitiveMaskedFields.includes(fieldPath)) {
                    obj[finalKey] = maskSensitiveValue(decryptedValue)
                } else {
                    obj[finalKey] = decryptedValue
                }
            } catch (error) {
                console.error(`Decryption failed for ${fieldPath}:`, error.message)
            }
        } else {
            // handle plain (non-encrypted) but still mask if needed
            if (sensitiveMaskedFields.includes(fieldPath)) {
                obj[finalKey] = maskSensitiveValue(obj[finalKey])
            }
        }
    }
}

export const decryptSensitiveFields = (data) => {
    if (!data || typeof data !== 'object') return data

    const stack = [data] // Use a stack instead of recursion

    while (stack.length) {
        const obj = stack.pop()

        // Avoid processing the same object twice
        if (visitedObjects.has(obj)) {
            continue
        }
        visitedObjects.add(obj)

        // Decrypt all sensitive fields
        sensitiveFieldsForDecryption.forEach((field) => decryptNestedField(obj, field))

        // Push nested objects & arrays to the stack (instead of recursive calls)
        Object.keys(obj).forEach((key) => {
            if (Array.isArray(obj[key])) {
                obj[key].forEach((item) => {
                    if (typeof item === 'object' && item !== null) stack.push(item)
                })
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                stack.push(obj[key])
            }
        })
    }

    return data
}

export const encryptionMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = encryptSensitiveFields(req.body)
    }
    next()
}
