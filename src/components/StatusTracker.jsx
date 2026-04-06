const DEFAULT_STEPS = [
	'Uploading original',
	'Generating variants',
	'Uploading outputs',
	'Fetching S3 metadata',
	'Complete',
]

function StatusTracker({ steps = DEFAULT_STEPS, activeStep = -1, isRunning = false }) {
	const progress =
		activeStep < 0 ? 0 : ((Math.min(activeStep, steps.length - 1) + 1) / steps.length) * 100

	return (
		<section className="glass-card rounded-2xl p-6 md:p-7">
			<div className="mb-5 flex items-center justify-between gap-4">
				<h2 className="section-title">Processing Status</h2>
				<span className="rounded-full border border-slate-600/50 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300">
					{isRunning ? 'In progress' : activeStep >= steps.length - 1 ? 'Complete' : 'Waiting'}
				</span>
			</div>

			<div className="relative">
				<div className="absolute left-5 right-5 top-5 h-0.5 rounded-full bg-slate-700 md:left-8 md:right-8" />
				<div
					className="absolute left-5 top-5 h-0.5 rounded-full bg-linear-to-r from-cyan-500 via-sky-500 to-indigo-500 transition-all duration-700 md:left-8"
					style={{ width: `${progress}%` }}
				/>

				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-5 md:gap-x-4">
					{steps.map((step, index) => {
						const isComplete = index < activeStep
						const isActive = index === activeStep

						return (
							<div key={step} className="relative z-10 flex min-w-0 flex-col items-center text-center">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
										isComplete
											? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-lg shadow-emerald-400/25'
											: isActive
												? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-lg shadow-cyan-400/35'
												: 'border-slate-600 bg-slate-800/60 text-slate-400'
									}`}
								>
									{isComplete ? '✓' : index + 1}
								</div>
								<p className="mt-3 max-w-30 text-[11px] font-medium leading-tight text-slate-300">
									{step}
								</p>
							</div>
						)
					})}
				</div>
			</div>

			<div className="mt-7 h-1.5 overflow-hidden rounded-full bg-slate-800/60">
				<div
					className="h-full rounded-full bg-linear-to-r from-cyan-500 via-sky-500 to-indigo-500 transition-all duration-700"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</section>
	)
}

export default StatusTracker
