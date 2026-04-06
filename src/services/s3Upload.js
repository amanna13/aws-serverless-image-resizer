import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const region = import.meta.env.VITE_AWS_REGION
const bucket = import.meta.env.VITE_S3_BUCKET
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_KEY

const s3Config = { region }

if (accessKeyId && secretAccessKey) {
	s3Config.credentials = {
		accessKeyId,
		secretAccessKey,
	}
}

const s3Client = new S3Client(s3Config)

const sanitizeFileName = (fileName) =>
	fileName
		.replace(/\.[^.]+$/, '')
		.replace(/[^a-zA-Z0-9-_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase() || 'image'

const getFileExtension = (fileName) => {
	const extension = fileName.split('.').pop()?.toLowerCase()
	if (!extension || extension === fileName.toLowerCase()) {
		return '.jpg'
	}

	return `.${extension}`
}

const createUniqueFileName = (fileName, prefix = 'uploads') => {
	const timestamp = Date.now()
	const baseName = sanitizeFileName(fileName)
	const extension = getFileExtension(fileName)
	return `${prefix}/${timestamp}-${baseName}${extension}`
}

const normalizeBody = async (body) => {
	if (body instanceof Blob) {
		return body.arrayBuffer()
	}

	if (body instanceof ArrayBuffer) {
		return body
	}

	if (ArrayBuffer.isView(body)) {
		return body.buffer
	}

	return body
}

const loadImage = (source) =>
	new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = () => reject(new Error('Unable to load image for resizing.'))
		image.src = source
	})

export const resizeImageFile = async (file, targetWidth, quality = 0.85) => {
	const objectUrl = URL.createObjectURL(file)

	try {
		const image = await loadImage(objectUrl)
		const scale = Math.min(1, targetWidth / image.width)
		const width = Math.max(1, Math.round(image.width * scale))
		const height = Math.max(1, Math.round(image.height * scale))
		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height

		const context = canvas.getContext('2d')
		if (!context) {
			throw new Error('Canvas context is not available in this browser.')
		}

		context.drawImage(image, 0, 0, width, height)

		const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'

		return await new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Unable to create resized image.'))
						return
					}

					resolve(blob)
				},
				outputType,
				quality,
			)
		})
	} finally {
		URL.revokeObjectURL(objectUrl)
	}
}

const toReadableMetadata = (response) => ({
	contentLength: response.ContentLength ?? 0,
	contentType: response.ContentType ?? 'application/octet-stream',
	lastModified: response.LastModified ? response.LastModified.toISOString() : '',
	eTag: response.ETag ? response.ETag.replace(/"/g, '') : '',
	metadata: response.Metadata ?? {},
})

export const uploadBlobToS3 = async (body, { fileName, contentType, keyPrefix = 'uploads' } = {}) => {
	if (!region || !bucket) {
		throw new Error('Missing required S3 environment variables.')
	}

	if (!fileName) {
		throw new Error('A file name is required for S3 uploads.')
	}

	const key = createUniqueFileName(fileName, keyPrefix)
	const command = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		Body: await normalizeBody(body),
		ContentType: contentType || 'application/octet-stream',
	})

	try {
		await s3Client.send(command)
	} catch (error) {
		if (error?.name === 'TypeError' || /failed to fetch/i.test(error?.message || '')) {
			throw new Error(
				'S3 upload failed in the browser. Check the bucket CORS policy, IAM permissions, and region configuration.',
			)
		}

		throw new Error(error?.message || 'S3 upload failed.')
	}

	return key
}

export const uploadFileToS3 = async (file, options = {}) => {
	if (!file) {
		throw new Error('No file provided for upload.')
	}

	return uploadBlobToS3(file, {
		fileName: file.name,
		contentType: file.type,
		...options,
	})
}

export const getS3ObjectMetadata = async (key) => {
	if (!region || !bucket) {
		throw new Error('Missing required S3 environment variables.')
	}

	const response = await s3Client.send(
		new HeadObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	)

	return toReadableMetadata(response)
}

export const getS3DownloadUrl = async (key, expiresIn = 3600) => {
	if (!region || !bucket) {
		throw new Error('Missing required S3 environment variables.')
	}

	return getSignedUrl(
		s3Client,
		new GetObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
		{ expiresIn },
	)
}

export const uploadAndDescribeFile = async (file, options = {}) => {
	const key = await uploadFileToS3(file, options)
	const downloadUrl = await getS3DownloadUrl(key)

	return {
		key,
		downloadUrl,
		metadata: {
			contentLength: file.size ?? 0,
			contentType: file.type || 'application/octet-stream',
			lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
			eTag: '',
			metadata: {},
		},
	}
}

export const uploadToS3 = uploadFileToS3

export default uploadFileToS3
