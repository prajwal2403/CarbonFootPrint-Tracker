import { useState } from 'react'
import { compute, createLog } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

// Icon components
const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const LoadingIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const CarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
)

const ElectricIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const FoodIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
  </svg>
)

const TotalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const BulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

export default function LogActivity() {
	const { user } = useAuth()
	const [form, setForm] = useState({
		date: new Date().toISOString().slice(0, 10),
		travelKm: 0,
		travelMode: 'car',
		electricityKwh: 0,
		diet: 'mixed',
	})
	const [calc, setCalc] = useState({ travelKg: 0, electricityKg: 0, foodKg: 0, totalKg: 0, ecoScore: 0, tips: [] })
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	function onChange(e) {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: name === 'travelKm' || name === 'electricityKwh' ? Number(value) : value }))
		setSaved(false) // Reset saved state when form changes
	}

	async function onSubmit(e) {
		e.preventDefault()
		if (!user) {
			console.error('User not logged in')
			return
		}
		setSaving(true)
		try {
			const computed = await compute(form)
			setCalc(computed)
			await createLog(user.id, form)
			setSaved(true)
			setTimeout(() => setSaved(false), 3000) // Reset after 3 seconds
		} catch (error) {
			console.error('Error saving log:', error)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
			<form onSubmit={onSubmit} className="card lg:col-span-2 space-y-6">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
						<CarIcon />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-slate-800">Log Daily Activity</h2>
						<p className="text-slate-500">Track your carbon footprint for today</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<label className="block">
						<span className="text-sm font-semibold text-slate-700 mb-2 block">Date</span>
						<input 
							type="date" 
							name="date" 
							value={form.date} 
							onChange={onChange} 
							className="input-field"
							required
						/>
					</label>
					
					<label className="block">
						<span className="text-sm font-semibold text-slate-700 mb-2 block">Travel Distance (km)</span>
						<input 
							type="number" 
							min="0" 
							step="0.1" 
							name="travelKm" 
							value={form.travelKm} 
							onChange={onChange} 
							className="input-field"
							placeholder="Enter distance"
						/>
					</label>
					
					<label className="block">
						<span className="text-sm font-semibold text-slate-700 mb-2 block">Mode of Transport</span>
						<select 
							name="travelMode" 
							value={form.travelMode} 
							onChange={onChange} 
							className="input-field"
						>
							<option value="car">🚗 Car</option>
							<option value="bus">🚌 Bus</option>
							<option value="train">🚆 Train</option>
							<option value="bike">🚴‍♂️ Bike</option>
							<option value="walk">🚶‍♂️ Walk</option>
						</select>
					</label>
					
					<label className="block">
						<span className="text-sm font-semibold text-slate-700 mb-2 block">Electricity Usage (kWh)</span>
						<input 
							type="number" 
							min="0" 
							step="0.1" 
							name="electricityKwh" 
							value={form.electricityKwh} 
							onChange={onChange} 
							className="input-field"
							placeholder="Enter kWh"
						/>
					</label>
					
					<label className="block sm:col-span-2">
						<span className="text-sm font-semibold text-slate-700 mb-2 block">Diet Type</span>
						<select 
							name="diet" 
							value={form.diet} 
							onChange={onChange} 
							className="input-field"
						>
							<option value="vegan">🌱 Vegan</option>
							<option value="vegetarian">🥗 Vegetarian</option>
							<option value="mixed">🍽️ Mixed</option>
							<option value="nonveg">🥩 Non-Vegetarian</option>
						</select>
					</label>
				</div>

				{/* Emission Metrics */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<Metric 
						title="Travel" 
						value={`${calc.travelKg} kg`} 
						icon={<CarIcon />}
						color="from-blue-500 to-indigo-600"
					/>
					<Metric 
						title="Electricity" 
						value={`${calc.electricityKg} kg`} 
						icon={<ElectricIcon />}
						color="from-yellow-500 to-orange-600"
					/>
					<Metric 
						title="Food" 
						value={`${calc.foodKg} kg`} 
						icon={<FoodIcon />}
						color="from-green-500 to-emerald-600"
					/>
					<Metric 
						title="Total" 
						value={`${calc.totalKg} kg`} 
						icon={<TotalIcon />}
						color="from-purple-500 to-pink-600"
						isHighlighted
					/>
				</div>

				<div className="flex gap-3 pt-4">
					<button 
						disabled={saving} 
						className={`btn-primary ${saved ? 'bg-green-600 hover:bg-green-700' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
						type="submit"
					>
						{saving ? (
							<>
								<LoadingIcon />
								Computing...
							</>
						) : saved ? (
							<>
								<SaveIcon />
								Saved Successfully!
							</>
						) : (
							<>
								<SaveIcon />
								Save & Compute
							</>
						)}
					</button>
				</div>
			</form>

			{/* AI Suggestions Sidebar */}
			<aside className="card">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
						<BulbIcon />
					</div>
					<div>
						<h2 className="text-xl font-bold text-slate-800">AI Suggestions</h2>
						<p className="text-sm text-slate-500">Personalized tips</p>
					</div>
				</div>
				
				{calc.tips?.length ? (
					<div className="space-y-3">
						{calc.tips.map((tip, i) => (
							<div key={i} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
								<p className="text-sm text-emerald-800 leading-relaxed">{tip}</p>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<BulbIcon />
						<p className="text-slate-600 font-medium mt-2">Submit your data</p>
						<p className="text-sm text-slate-500 mt-1">Get personalized eco-friendly tips based on your activity</p>
					</div>
				)}
			</aside>
		</div>
	)
}

function Metric({ title, value, icon, color, isHighlighted = false }) {
	return (
		<div className={`metric-card ${isHighlighted ? 'ring-2 ring-purple-200' : ''}`}>
			<div className="flex items-center justify-between mb-3">
				<div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}>
					{icon}
				</div>
			</div>
			<div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
			<div className="text-xl font-bold text-slate-800">{value}</div>
		</div>
	)
}
