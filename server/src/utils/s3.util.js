import crypto, { sign } from 'crypto'
import sharp from 'sharp'
import stream from 'stream'
import { Upload } from '@aws-sdk/lib-storage' // Import Upload for handling streams
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { BadRequestError } from '../core/error.response.js'
import { s3, DeleteObjectCommand } from '../configs/s3.config.js' // Use your configured S3 client
import text2png from 'text2png'
import dotenv from 'dotenv'
dotenv.config()

const urlImagePublic = process.env.AWS_CLOUDFRONT_DOMAIN

function getContentType(ext) {
    const mimeMap = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        tiff: 'image/tiff',
        tif: 'image/tiff',
        ico: 'image/x-icon',

        psd: 'application/octet-stream', // Photoshop
        ai: 'application/postscript', // Illustrator
        eps: 'application/postscript', // Encapsulated PostScript
        pdf: 'application/pdf',
        heic: 'image/heic',
        heif: 'image/heif',

        mp4: 'video/mp4',
        mov: 'video/quicktime',
        webm: 'video/webm',

        zip: 'application/zip',
        rar: 'application/vnd.rar',
        '7z': 'application/x-7z-compressed',

        json: 'application/json',
        txt: 'text/plain',
    }

    return mimeMap[ext] || 'application/octet-stream' // fallback
}

const generateUniqueFilename = (originalname) => {
    const ext = originalname.split('.').pop()
    return `${crypto.randomBytes(8).toString('hex')}.${ext}`
}

// UPLOAD FINAL DELIEVRY OF ORDER
export const uploadFinalDeliveryToS3 = async ({ file, width, height }) => {
    const ext = file.originalname.split('.').pop().toLowerCase()
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp', 'gif', 'heic'].includes(ext)
    const isGif = ext === 'gif'
    const originalKey = generateUniqueFilename(file.originalname).replace(/\.[^/.]+$/, '_original.webp')
    const watermarkedKey = originalKey.replace('_original', '_watermarked')

    if (!isImage) {
        // Upload raw file directly if not an image
        const result = await uploadBufferToS3(file.buffer, originalKey, getContentType(ext))
        return { watermarkedKey: originalKey } // no watermark
    }

    // Process image: Resize & Convert
    const resizedImage = sharp(file.buffer).rotate().resize(width, height, { fit: 'inside' })
    const resizedBuffer = await resizedImage.toBuffer()
    const metadata = await sharp(resizedBuffer).metadata()

    const overlay = await generateWatermarkOverlay(metadata.width, metadata.height)

    const watermarkedBuffer = await sharp(resizedBuffer)
        .composite([{ input: overlay, blend: 'over' }])
        .webp({ quality: 90, effort: 6, lossless: false, animated: isGif })
        .toBuffer()

    // Upload original and watermarked
    await uploadBufferToS3(resizedBuffer, originalKey, 'image/webp')
    await uploadBufferToS3(watermarkedBuffer, watermarkedKey, 'image/webp')

    return { watermarkedKey }
}

// export const uploadImageToS3 = async ({ buffer, originalname, width = null, height = null, compress = true }) => {
//     try {
//         const ext = originalname.split(".").pop().toLowerCase();
//         const isGif = ext === "gif";

//         let finalImageName = generateUniqueFilename(originalname).replace(/\.[^/.]+$/, ".webp");
//         const processedBuffer = await convertToWebp(buffer, { width, height, isGif, compress });

//         const result = await uploadBufferToS3(processedBuffer, finalImageName, "image/webp");
//         return { result };
//     } catch (error) {
//         console.error("❌ Error uploading image to S3:", error);
//         throw new BadRequestError("Error uploading image to S3");
//     }
// };

export const uploadImageToS3 = async ({
    buffer,
    originalname,
    width = null,
    height = null,
    compress = true,
    isWatermark = false, // NEW
    fullName = '', // NEW (used only when isWatermark = true)
    s3Prefix = '', // optional folder
}) => {
    try {
        const ext = originalname.split('.').pop().toLowerCase()
        const isGif = ext === 'gif'
        const finalImageName = `${s3Prefix}${generateUniqueFilename(originalname).replace(/\.[^/.]+$/, '.webp')}`

        let outBuffer

        if (!isWatermark) {
            // old path: convert/resize -> webp
            outBuffer = await convertToWebp(buffer, { width, height, isGif, compress })
        } else {
            // watermark path (static images only)
            const supported = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp', 'heic']
            if (isGif || !supported.includes(ext)) {
                throw new BadRequestError('Only static images can be watermarked.')
            }

            const base = sharp(buffer).rotate()
            const resized = compress ? base.resize(width, height, { fit: 'inside' }) : base
            const resizedBuffer = await resized.toBuffer()

            const meta = await sharp(resizedBuffer).metadata()
            const W = meta.width,
                H = meta.height

            const gradient = await makeBottomGradientOverlay(W, H, { coverageRatio: 0.35, maxOpacity: 0.45 })
            const textPng = await makeWatermarkText(`Pastal © ${fullName}`, W)

            const textMeta = await sharp(textPng).metadata()
            const textW = textMeta.width ?? Math.round(W * 0.6)
            const textH = textMeta.height ?? 64
            // const bottomPadding = Math.max(16, Math.round(H * 0.04));
            // const top = Math.max(0, H - textH - bottomPadding);
            const basePadding = Math.max(16, Math.round(H * 0.04))
            const bottomPadding = Math.max(4, basePadding - 18) // use 15–20; e.g. 18px
            const left = Math.round((W - textW) / 2)
            const top = Math.max(0, H - textH - bottomPadding)

            outBuffer = await sharp(resizedBuffer)
                .composite([
                    { input: gradient, left: 0, top: 0, blend: 'over' },
                    { input: textPng, left, top, blend: 'over' },
                ])
                .webp({ quality: 90, effort: 6, lossless: false })
                .toBuffer()
        }

        const result = await uploadBufferToS3(outBuffer, finalImageName, 'image/webp')
        return { result }
    } catch (error) {
        console.error('❌ Error uploading image to S3:', error)
        throw new BadRequestError('Error uploading image to S3')
    }
}

export const uploadWatermarkedImageToS3 = async ({ buffer, originalname, width = null, height = null, compress = true }) => {
    try {
        const ext = originalname.split('.').pop().toLowerCase()
        const isGif = ext === 'gif'

        let finalImageName = generateUniqueFilename(originalname).replace(/\.[^/.]+$/, '.webp')
        let processedBuffer = buffer

        if (!isGif) {
            const resizedImage = sharp(buffer).rotate().resize(width, height, { fit: 'inside' })
            const resizedBuffer = await resizedImage.toBuffer()
            const metadata = await sharp(resizedBuffer).metadata()

            const overlay = await generateWatermarkOverlay(metadata.width, metadata.height)

            processedBuffer = await sharp(resizedBuffer)
                .composite([{ input: overlay, blend: 'over' }])
                .webp({ quality: 90, effort: 6, lossless: false })
                .toBuffer()
        }

        const result = await uploadBufferToS3(processedBuffer, finalImageName, 'image/webp')
        return { result }
    } catch (error) {
        console.error('❌ Error uploading watermarked image to S3:', error)
        throw new BadRequestError('Error uploading watermarked image to S3')
    }
}

export const watermarkStandardImage = async ({
    file, // { originalname: string, buffer: Buffer }
    fullName, // string, e.g. "Phap Luu"
    width = 2048, // target bounding box width
    height = 2048, // target bounding box height
}) => {
    const ext = file.originalname.split('.').pop().toLowerCase()
    const isSupportedImage = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp', 'heic'].includes(ext)
    if (!isSupportedImage) {
        throw new Error('watermarkStandardImage: only non-animated image types are supported.')
    }
    // Build base image: EXIF rotate + fit inside the target box (no upscaling beyond original)
    const base = sharp(file.buffer).rotate().resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
    })

    const meta = await base.metadata()
    const W = meta.width ?? width
    const H = meta.height ?? height

    // --- gradient (bottom -> transparent) occupying ~35% of image height ---
    const gradient = await makeBottomGradientOverlay(W, H, { coverageRatio: 0.35, maxOpacity: 0.55 })

    // --- watermark text image (auto font size) ---
    const textPng = await makeWatermarkText(`Pastal © ${fullName}`, W)

    const textMeta = await sharp(textPng).metadata()
    const textW = textMeta.width ?? Math.round(W * 0.6)
    const textH = textMeta.height ?? 64

    // Position: centered horizontally, a bit above the bottom
    const bottomPadding = Math.max(16, Math.round(H * 0.04))
    const left = Math.round((W - textW) / 2)
    const top = Math.max(0, H - textH - bottomPadding)

    const out = await base
        .composite([
            // gradient spans full width but only bottom segment is drawn (SVG already clipped)
            { input: gradient, left: 0, top: 0, blend: 'over' },
            // text on top
            { input: textPng, left, top, blend: 'over' },
        ])
        .webp({ quality: 90, effort: 6, lossless: false })
        .toBuffer()

    return out // Buffer of watermarked WebP
}

async function makeBottomGradientOverlay(
    width,
    height,
    {
        coverageRatio = 0.35, // portion of image height the gradient occupies
        maxOpacity = 0.4, // opacity at the very bottom
    } = {}
) {
    const gradHeight = Math.max(1, Math.round(height * coverageRatio))
    // SVG gradient: bottom (black @ maxOpacity) -> top of gradient (black @ 0)
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <defs>
        <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="black" stop-opacity="${maxOpacity}"/>
            <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
        </defs>
        <rect x="0" y="${height - gradHeight}" width="${width}" height="${gradHeight}" fill="url(#g)"/>
    </svg>`
    return Buffer.from(svg)
}

async function makeWatermarkText(text, imageWidth) {
    // Auto font size ≈ 1/18 of width (clamped between 24–64)
    const size = clamp(Math.round((imageWidth / 24) * 0.65), 18, 48)

    // Slightly higher opacity to be readable; gradient underneath does the heavy lifting
    const png = text2png(text, {
        font: `600 ${size}px Arial, sans-serif`,
        color: 'rgba(255,255,255,0.95)',
        backgroundColor: 'transparent',
        padding: Math.max(12, Math.round(size * 0.4)), // breathing room
        // Optional: subtle shadow for extra contrast (comment out if unwanted)
        // text2png supports stroke? If not available in your version, omit these:
        // strokeColor: "rgba(0,0,0,0.35)",
        // strokeWidth: Math.max(1, Math.round(size * 0.06)),
    })

    return png
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v))
}

export const readSignedUrl = async (imageKey) => {
    try {
        const signedUrl = getSignedUrl({
            url: `${urlImagePublic}/${imageKey}`,
            keyPairId: process.env.AWS_CLOUDFRONT_KEYPAIR_ID,
            dateLessThan: new Date(Date.now() + 1000 * 3600), //60'
            privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
        })
        return signedUrl
    } catch (error) {
        console.error('Error reading signed url:', error)
        throw new BadRequestError('Error reading signed url')
    }
}

export const deleteImageFromS3 = async (key) => {
    try {
        // Create a DeleteObjectCommand with the specified key
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        })

        // Send the delete command to S3
        const result = await s3.send(deleteCommand)
        console.log('Deleting image from S3:', key)
        return result
    } catch (error) {
        console.error('Error deleting image from S3:', error)
        throw new BadRequestError('Error deleting image from S3')
    }
}

export const getCloudFrontUrl = (key) => {
    if (['/uploads/pastal_system_default_background2.png', '/uploads/pastal_system_default_avatar.png', '/uploads/default-bg.png'].includes(key)) {
        return key
    }

    if (!['webp', 'png', 'jpg', 'jpeg', 'gif', 'ai', 'tif'].some((ext) => key.includes(ext))) {
        return key
    }
    return `${urlImagePublic}/${key}`
}

export const extractImageKeyFromUrl = (url) => {
    const result = url.split('/').pop()
    return result
}

const convertToWebp = async (buffer, { width, height, isGif, compress }) => {
    if (!compress) return buffer

    const sharpInstance = sharp(buffer, { animated: isGif }).rotate().resize(width, height, { fit: 'inside' })
    return sharpInstance
        .webp({
            quality: 90,
            effort: 6,
            lossless: false,
            animated: isGif,
        })
        .toBuffer()
}

const generateWatermarkOverlay = async (imageWidth, imageHeight) => {
    const watermarkTileBuffer = text2png('Pastal art commission', {
        font: '500 36px Arial',
        color: 'rgba(255,255,255,0.25)',
        backgroundColor: 'transparent',
        padding: 25,
    })

    const watermarkTile = await sharp(watermarkTileBuffer)
        .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()

    const tileMeta = await sharp(watermarkTile).metadata()

    const tiles = []
    for (let y = -tileMeta.height; y < imageHeight + tileMeta.height; y += tileMeta.height + 20) {
        for (let x = -tileMeta.width; x < imageWidth + tileMeta.width; x += tileMeta.width + 20) {
            tiles.push({ input: watermarkTile, top: y, left: x, blend: 'over' })
        }
    }

    const overlay = await sharp({
        create: {
            width: imageWidth,
            height: imageHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(tiles.filter((tile) => tile.left >= 0 && tile.top >= 0 && tile.left < imageWidth && tile.top < imageHeight))
        .png()
        .toBuffer()

    return overlay
}

const uploadBufferToS3 = async (buffer, filename, contentType) => {
    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)

    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: bufferStream,
            ContentType: contentType,
        },
    })

    return upload.done()
}
