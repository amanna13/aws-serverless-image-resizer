import { useId, useRef, useState } from 'react'

function UploadBox({ selectedName, previewUrl, onFileSelect, onClear, disableClear = false, isProcessing = false }) {
	const [isDragging, setIsDragging] = useState(false)
	const inputId = useId()
	const inputRef = useRef(null)

	const handleDragOver = (event) => {
		event.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (event) => {
		event.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (event) => {
		event.preventDefault()
		setIsDragging(false)

		const file = event.dataTransfer.files?.[0]
		if (file && file.type.startsWith('image/')) {
			onFileSelect(file)
			return
		}

		onFileSelect(null)
	}

	const handleInputChange = (event) => {
		const file = event.target.files?.[0]
		if (file && file.type.startsWith('image/')) {
			onFileSelect(file)
			event.target.value = ''
			return
		}

		onFileSelect(null)
		event.target.value = ''
	}

	const handleClearPreview = () => {
		if (isProcessing) {
			return
		}

		if (inputRef.current) {
			inputRef.current.value = ''
		}

		if (onClear) {
			onClear()
			return
		}

		onFileSelect(null)
	}

	return (
		<div className="glass-card w-full rounded-2xl p-6">
			<h2 className="section-title mb-3">Upload Box</h2>
			<label
				htmlFor={inputId}
				className={`mt-3 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
					isDragging
						? 'border-cyan-400 bg-cyan-400/15 shadow-lg shadow-cyan-400/30'
						: 'border-slate-600 bg-slate-950/50 hover:border-cyan-300 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-cyan-400/20'
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept="image/*"
					className="hidden"
					onClick={(event) => {
						event.currentTarget.value = ''
					}}
					onChange={handleInputChange}
				/>
				<p className="text-sm font-semibold text-slate-100">Drag and drop image</p>
				<p className="mt-1 text-xs text-slate-400">or click to browse</p>
				{selectedName ? (
					<span className="mt-3 rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300">
						{selectedName}
					</span>
				) : null}
				{isProcessing ? (
					<span className="mt-3 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
						Processing upload and outputs...
					</span>
				) : null}
			</label>

			{previewUrl ? (
				<div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-xl shadow-black/30">
					<button
						type="button"
						aria-label="Clear selected image"
						onClick={handleClearPreview}
						disabled={disableClear || isProcessing}
						className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-400/40 bg-slate-900/80 text-lg leading-none text-slate-100 transition hover:border-rose-300/60 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
					>
						×
					</button>
					<img
						src={previewUrl}
						alt="Selected file preview"
						className="h-48 w-full object-cover"
					/>
				</div>
			) : null}
		</div>
	)
}

export default UploadBox
