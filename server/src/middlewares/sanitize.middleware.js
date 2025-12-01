import sanitizeHtml from 'sanitize-html'
import sanitize from 'mongo-sanitize'

const sanitizeHtmlOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'div', 'span', 'p', 'img', 'section', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'ol', 'br', 'hr', 'blockquote'],
    allowedAttributes: {
        '*': ['class', 'id', 'style'],
        a: ['href', 'target'],
        img: ['src', 'alt'],
        font: ['size'],
    },
    allowedSchemes: ['http', 'https'],
}

// ✅ Recursive sanitizer (unchanged logic)
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item))
    } else if (obj && typeof obj === 'object' && !Buffer.isBuffer(obj)) {
        const sanitizedObject = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key.startsWith('$')) continue
                sanitizedObject[key] = sanitizeObject(obj[key])
            }
        }
        return sanitizedObject
    } else if (typeof obj === 'string') {
        return sanitizeHtml(sanitize(obj), sanitizeHtmlOptions)
    } else {
        return obj
    }
}

// ✅ ✅ SAFE MIDDLEWARE (NO REASSIGNMENTS)
const sanitizeInputs = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        const cleanBody = sanitizeObject(req.body)
        Object.assign(req.body, cleanBody) // ✅ mutate instead of replace
    }

    if (req.query && typeof req.query === 'object') {
        const cleanQuery = sanitizeObject(req.query)
        Object.assign(req.query, cleanQuery) // ✅ THIS FIXES YOUR CRASH
    }

    if (req.params && typeof req.params === 'object') {
        const cleanParams = sanitizeObject(req.params)
        Object.assign(req.params, cleanParams) // ✅ safe
    }

    next()
}

export default sanitizeInputs
