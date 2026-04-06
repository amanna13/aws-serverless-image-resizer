function formatBytes(bytes) {
	if (!bytes && bytes !== 0) {
		return '0 B'
	}

	const units = ['B', 'KB', 'MB', 'GB']
	let value = bytes
	let index = 0

	while (value >= 1024 && index < units.length - 1) {
		value /= 1024
		index += 1
	}

	return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function formatDate(value) {
	if (!value) {
		return 'Unknown'
	}

	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString()
}

function MetadataChip({ label, value }) {
	return (
		<div className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2">
			<p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
			<p className="mt-1 break-all text-xs font-medium text-slate-100">{value || '—'}</p>
		</div>
	)
}

function OutputCard({ image }) {
	return (
		<article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/70 shadow-lg shadow-black/20">
			<div className="border-b border-slate-700/50 px-4 py-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-semibold text-slate-100">{image.label}</p>
					<button
						type="button"
						onClick={() => image.onDownload?.(image)}
						className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-500/25"
					>
						Download
					</button>
				</div>
			</div>

			<img src={image.downloadUrl} alt={image.label} className="h-52 w-full object-cover" />

			<div className="space-y-3 px-4 py-4">
				<div className="grid gap-2 sm:grid-cols-2">
					<MetadataChip label="Type" value={image.metadata?.contentType} />
					<MetadataChip label="Size" value={formatBytes(image.metadata?.contentLength)} />
					<MetadataChip label="Last modified" value={formatDate(image.metadata?.lastModified)} />
				</div>

				{image.metadata?.eTag ? (
					<MetadataChip label="ETag" value={image.metadata.eTag} />
				) : null}
			</div>
		</article>
	)
}

function ResultView({ resultData, onDownloadAll, onDownloadOne }) {
	if (!resultData) {
		return (
			<section className="glass-card rounded-2xl p-6">
				<h2 className="section-title">Result Viewer</h2>
				<p className="mt-4 rounded-lg border border-slate-700/80 bg-slate-950/50 p-4 text-xs text-slate-400">
					Upload an image to view the S3 outputs, metadata, and download actions.
				</p>
			</section>
		)
	}

	return (
		<section className="glass-card rounded-2xl p-6 md:p-7">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 className="section-title">Result Viewer</h2>
					<p className="mt-2 text-sm text-slate-400">
						{resultData.outputs.length} S3 output{resultData.outputs.length === 1 ? '' : 's'} generated from{' '}
						{resultData.source.name}
					</p>
				</div>

				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => onDownloadAll?.(resultData.outputs, resultData.source.name)}
						className="rounded-xl border border-cyan-300/40 bg-cyan-500/20 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-500/30"
					>
						Download all
					</button>
				</div>
			</div>

			<div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<MetadataChip label="Source size" value={formatBytes(resultData.source.metadata?.contentLength)} />
				<MetadataChip label="Source type" value={resultData.source.metadata?.contentType} />
				<MetadataChip label="Source modified" value={formatDate(resultData.source.metadata?.lastModified)} />
				<MetadataChip label="Source format" value={resultData.source.name.split('.').pop()?.toUpperCase() || 'IMAGE'} />
			</div>

			<div className="mt-6 grid gap-5 xl:grid-cols-2">
				{resultData.outputs.map((image) => (
					<OutputCard key={image.key} image={{ ...image, onDownload: onDownloadOne }} />
				))}
			</div>
		</section>
	)
}

export default ResultView
