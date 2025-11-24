import multer from 'multer'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB in bytes

const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './src/uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`)
        },
    }),
})

const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE - 1, // Ensures file size is strictly < 15MB
    },
})

const uploadFields = uploadMemory.fields([{ name: 'files', maxCount: 5 }])

export { uploadDisk, uploadFields, uploadMemory }
