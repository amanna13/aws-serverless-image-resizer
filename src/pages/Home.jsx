import { useEffect, useState } from 'react'
import Gallery from '../components/Gallery'
import OptionsPanel from '../components/OptionsPanel'
import ResultView from '../components/ResultView'
import StatusTracker from '../components/StatusTracker'
import UploadBox from '../components/UploadBox'
import {
	getS3DownloadUrl,
	resizeImageFile,
	uploadBlobToS3,
	uploadAndDescribeFile,
} from '../services/s3Upload'

const STATUS_STEPS = [
	'Uploading original',
	'Generating variants',
	'Uploading outputs',
	'Fetching S3 metadata',
	'Completed',
]

const OUTPUT_VARIANTS = [
	{ id: 'small', label: 'Small', width: 480 },
	{ id: 'medium', label: 'Medium', width: 960 },
	{ id: 'large', label: 'Large', width: 1440 },
]

const QUALITY_PRESETS = {
	balanced: 0.82,
	quality: 0.95,
}

const GALLERY_ITEMS = [
	{ id: 1, name: 'mountain.jpg', url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?auto=format&fit=crop&w=900&q=80' },
	{ id: 2, name: 'city.jpg', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80' },
	{ id: 3, name: 'forest.jpg', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80' },
	{ id: 4, name: 'sunset.jpg', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
]

const sanitizeBaseName = (fileName) =>
	fileName
		.replace(/\.[^.]+$/, '')
		.replace(/[^a-zA-Z0-9-_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '') || 'image'

const getExtensionFromMimeType = (mimeType) => {
	if (mimeType === 'image/png') {
		return '.png'
	}

	if (mimeType === 'image/webp') {
		return '.webp'
	}

	return '.jpg'
}

const buildVariantFileName = (sourceName, variantLabel, mimeType) => {
	const baseName = sanitizeBaseName(sourceName)
	const suffix = variantLabel.toLowerCase()
	return `${baseName}-${suffix}${getExtensionFromMimeType(mimeType)}`
}

const buildLocalMetadata = (fileOrBlob, override = {}) => ({
	contentLength: fileOrBlob.size ?? override.contentLength ?? 0,
	contentType: fileOrBlob.type ?? override.contentType ?? 'application/octet-stream',
	lastModified:
		fileOrBlob.lastModified && fileOrBlob.lastModified > 0
			? new Date(fileOrBlob.lastModified).toISOString()
			: new Date().toISOString(),
	eTag: override.eTag ?? '',
	metadata: override.metadata ?? {},
})

const triggerDownload = (blob, fileName) => {
	const objectUrl = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = objectUrl
	link.download = fileName
	document.body.appendChild(link)
	link.click()
	link.remove()
	setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

const downloadFromSignedUrl = async (downloadUrl, fileName) => {
	const response = await fetch(downloadUrl)
	if (!response.ok) {
		throw new Error('Unable to download file from S3.')
	}

	const blob = await response.blob()
	triggerDownload(blob, fileName)
}

const downloadZipFromOutputs = async (outputs = [], sourceName = 'images') => {
		const { default: JSZip } = await import('jszip')
	const zip = new JSZip()

	await Promise.all(
		outputs.map(async (output) => {
			const response = await fetch(output.downloadUrl)
			if (!response.ok) {
				throw new Error(`Unable to download ${output.label.toLowerCase()} from S3.`)
			}

			const blob = await response.blob()
			zip.file(output.fileName, blob)
		}),
	)

	const zipBlob = await zip.generateAsync({ type: 'blob' })
	const zipFileName = `${sanitizeBaseName(sourceName)}-outputs.zip`
	triggerDownload(zipBlob, zipFileName)
}

function Home() {
	const [selectedFile, setSelectedFile] = useState(null)
	const [previewUrl, setPreviewUrl] = useState('')
	const [generateVariants, setGenerateVariants] = useState(true)
	const [qualityMode, setQualityMode] = useState('balanced')
	const [statusIndex, setStatusIndex] = useState(-1)
	const [isProcessing, setIsProcessing] = useState(false)
	const [resultData, setResultData] = useState(null)
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
		}
	}, [previewUrl])

	const handleFileSelect = (file) => {
		setSelectedFile(file)
		setResultData(null)
		setErrorMessage('')
		setStatusIndex(-1)

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
		}

		if (file) {
			const objectUrl = URL.createObjectURL(file)
			setPreviewUrl(objectUrl)
			return
		}

		setPreviewUrl('')
	}

	const handleReset = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
		}

		setSelectedFile(null)
		setPreviewUrl('')
		setStatusIndex(-1)
		setResultData(null)
		setIsProcessing(false)
		setErrorMessage('')
	}

	const handleDownloadAll = async (outputs = [], sourceName = 'images') => {
		await downloadZipFromOutputs(outputs, sourceName)
	}

	const handleDownloadOne = async (output) => {
		await downloadFromSignedUrl(output.downloadUrl, output.fileName)
	}

	const handleProcess = async () => {
		if (!selectedFile || isProcessing) {
			return
		}

		setIsProcessing(true)
		setErrorMessage('')
		setResultData(null)
		setStatusIndex(0)

		try {
			const source = await uploadAndDescribeFile(selectedFile, { keyPrefix: 'source' })
			setStatusIndex(1)

			const outputsToBuild = generateVariants ? OUTPUT_VARIANTS : [OUTPUT_VARIANTS[1]]
			const quality = QUALITY_PRESETS[qualityMode] ?? QUALITY_PRESETS.balanced
			const generatedFiles = await Promise.all(
				outputsToBuild.map(async (variant) => {
					const blob = await resizeImageFile(selectedFile, variant.width, quality)
					return {
						...variant,
						blob,
						localMetadata: buildLocalMetadata(blob),
						fileName: buildVariantFileName(selectedFile.name, variant.label, blob.type),
					}
				}),
			)
			setStatusIndex(2)

			const outputs = await Promise.all(
				generatedFiles.map(async (variantFile) => {
					const key = await uploadBlobToS3(variantFile.blob, {
						fileName: variantFile.fileName,
						contentType: variantFile.blob.type,
						keyPrefix: 'outputs',
					})

					const [downloadUrl] = await Promise.all([getS3DownloadUrl(key)])

					let metadata = variantFile.localMetadata
					try {
						const response = await fetch(downloadUrl, { method: 'HEAD' })
						metadata = {
							contentLength: Number(response.headers.get('content-length')) || variantFile.localMetadata.contentLength,
							contentType: response.headers.get('content-type') || variantFile.localMetadata.contentType,
							lastModified: response.headers.get('last-modified') || variantFile.localMetadata.lastModified,
							eTag: response.headers.get('etag')?.replace(/"/g, '') || variantFile.localMetadata.eTag,
							metadata: variantFile.localMetadata.metadata,
						}
					} catch {
						metadata = variantFile.localMetadata
					}

					return {
						id: variantFile.id,
						label: variantFile.label,
						key,
						fileName: variantFile.fileName,
						downloadUrl,
						metadata,
					}
				}),
			)
			setStatusIndex(3)

			const sourceDownloadUrl = await getS3DownloadUrl(source.key)
			let sourceMetadata = buildLocalMetadata(selectedFile)
			try {
				const response = await fetch(sourceDownloadUrl, { method: 'HEAD' })
				sourceMetadata = {
					contentLength: Number(response.headers.get('content-length')) || sourceMetadata.contentLength,
					contentType: response.headers.get('content-type') || sourceMetadata.contentType,
					lastModified: response.headers.get('last-modified') || sourceMetadata.lastModified,
					eTag: response.headers.get('etag')?.replace(/"/g, '') || sourceMetadata.eTag,
					metadata: sourceMetadata.metadata,
				}
			} catch {
				// Fall back to local file metadata if the browser cannot read S3 headers.
			}
			setStatusIndex(4)

			setResultData({
				qualityMode,
				generateVariants,
				source: {
					...source,
					name: selectedFile.name,
					downloadUrl: sourceDownloadUrl,
					metadata: sourceMetadata,
				},
				outputs,
			})
		} catch (error) {
			setErrorMessage(error?.message || 'Processing failed. Please try again.')
			setStatusIndex(-1)
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<main className="aurora-shell soft-grid relative min-h-screen bg-[#0f172a] text-slate-100">
			<div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<header className="mb-14 text-center">
					<h1 className="bg-linear-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
						Serverless Image Processor
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
						Upload, resize, and deliver images directly through S3.
					</p>
				</header>

				<section className="mb-12 grid gap-6 lg:grid-cols-2">
					<div>
						<UploadBox
							selectedName={selectedFile?.name}
							previewUrl={previewUrl}
							onFileSelect={handleFileSelect}
							onClear={handleReset}
							disableClear={isProcessing}
							isProcessing={isProcessing}
						/>
					</div>
					<div>
						<OptionsPanel
							generateVariants={generateVariants}
							qualityMode={qualityMode}
							onToggleMultipleSizes={() => setGenerateVariants((previous) => !previous)}
							onChangeQualityMode={setQualityMode}
						/>
					</div>
				</section>

				<div className="mb-4 flex justify-center gap-3">
					<button
						type="button"
						className="neon-btn rounded-xl px-7 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
						onClick={handleProcess}
						disabled={!selectedFile || isProcessing}
					>
						{isProcessing ? 'Processing...' : 'Upload & Process'}
					</button>
				</div>

				{errorMessage ? (
					<div className="mb-8 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
						{errorMessage}
					</div>
				) : null}

				{statusIndex >= 0 && (
					<div className="mb-12">
						<StatusTracker
							steps={STATUS_STEPS}
							activeStep={statusIndex}
							isRunning={isProcessing}
						/>
					</div>
				)}

				{resultData && (
					<div className="mb-12">
						<ResultView
							resultData={resultData}
							onDownloadAll={handleDownloadAll}
							onDownloadOne={handleDownloadOne}
						/>
					</div>
				)}

				<div className="mt-16 border-t border-slate-700/50 pt-12">
					<Gallery items={GALLERY_ITEMS} />
				</div>
			</div>
		</main>
	)
}

export default Home
