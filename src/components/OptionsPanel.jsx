function ToggleRow({ label, description, checked, onChange }) {
	return (
		<label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-700/80 bg-slate-950/45 px-4 py-3.5 transition hover:border-cyan-300/40 hover:bg-slate-900/55">
			<div className="space-y-0.5">
				<p className="text-sm text-slate-100">{label}</p>
				<p className="text-xs text-slate-400">{description}</p>
			</div>
			<span className="relative inline-flex h-6 w-11 items-center">
				<input
					type="checkbox"
					className="peer sr-only"
					checked={checked}
					onChange={onChange}
				/>
				<span className="absolute inset-0 rounded-full bg-slate-700 transition peer-checked:bg-cyan-500" />
				<span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
			</span>
		</label>
	)
}

function SegmentedOption({ label, description, value, options, onChange }) {
	return (
		<div className="rounded-xl border border-slate-700/80 bg-slate-950/45 px-4 py-3.5 transition hover:border-cyan-300/40 hover:bg-slate-900/55">
			<div className="mb-3 space-y-0.5">
				<p className="text-sm text-slate-100">{label}</p>
				<p className="text-xs text-slate-400">{description}</p>
			</div>
			<div className="grid grid-cols-2 gap-2">
				{options.map((option) => {
					const active = option.value === value

					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onChange(option.value)}
							className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
								active
									? 'border border-cyan-300/50 bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/10'
									: 'border border-slate-700/70 bg-slate-900/70 text-slate-300 hover:border-cyan-300/30 hover:text-slate-100'
							}`}
						>
							{option.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}

function OptionsPanel({
	generateVariants,
	qualityMode,
	onToggleMultipleSizes,
	onChangeQualityMode,
}) {
	return (
		<div className="glass-card w-full rounded-2xl p-6">
			<h2 className="section-title mb-3">Options Panel</h2>
			<div className="space-y-3">
				<ToggleRow
					label="Generate responsive outputs"
					description="Creates small, medium, and large S3 variants for easy delivery"
					checked={generateVariants}
					onChange={onToggleMultipleSizes}
				/>
				<SegmentedOption
					label="Optimization mode"
					description="Choose how aggressively the generated outputs are tuned"
					value={qualityMode}
					options={[
						{ label: 'Balanced', value: 'balanced' },
						{ label: 'High quality', value: 'quality' },
					]}
					onChange={onChangeQualityMode}
				/>
			</div>
		</div>
	)
}

export default OptionsPanel
