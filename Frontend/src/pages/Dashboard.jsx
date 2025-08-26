import { useEffect, useMemo, useState } from 'react'
import { listLogs } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

// Icon components
const TrendIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const ScoreIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BreakdownIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
)

const EmptyStateIcon = () => (
  <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-slate-200 rounded"></div>
    </div>
  )
}

function StatsCard({ title, value, subtitle, icon, color = "emerald" }) {
  const colorClasses = {
    emerald: "from-emerald-500 to-green-600 shadow-emerald-500/25",
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/25",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/25",
    red: "from-red-500 to-pink-600 shadow-red-500/25"
  }

  return (
    <div className="card-gradient">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-lg font-semibold text-slate-600 mb-1">{title}</div>
      {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
    </div>
  )
}

export default function Dashboard() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	
	useEffect(() => {
		setLoading(true)
		listLogs()
			.then(data => setLogs(data.items || []))
			.catch(() => setLogs([]))
			.finally(() => setLoading(false))
	}, [])
	
	const latest = logs[logs.length - 1]
	const eco = useMemo(() => latest ? Math.max(0, Math.min(100, Math.round(100 - (latest.totalKg / 10) * 100))) : 0, [latest])

	const lineData = logs.map(l => ({ date: l.date, total: l.totalKg }))
	const pieData = latest ? [
		{ name: 'Travel', value: latest.travelKg },
		{ name: 'Electricity', value: latest.electricityKg },
		{ name: 'Food', value: latest.foodKg },
	].filter(item => item.value > 0) : []

	const totalEmissions = latest ? latest.totalKg : 0
	const weeklyAverage = logs.length > 0 ? (logs.reduce((sum, log) => sum + log.totalKg, 0) / logs.length).toFixed(1) : 0

	if (loading) {
		return (
			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<LoadingSkeleton />
				</div>
				<div>
					<LoadingSkeleton />
				</div>
				<div>
					<LoadingSkeleton />
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Stats Overview */}
			<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard 
					title="Eco Score" 
					value={eco}
					subtitle="out of 100"
					icon={<ScoreIcon />}
					color="emerald"
				/>
				<StatsCard 
					title="Today's Emissions" 
					value={`${totalEmissions} kg`}
					subtitle="CO₂ equivalent"
					icon={<BreakdownIcon />}
					color="blue"
				/>
				<StatsCard 
					title="Weekly Average" 
					value={`${weeklyAverage} kg`}
					subtitle="per day"
					icon={<TrendIcon />}
					color="amber"
				/>
				<StatsCard 
					title="Total Logs" 
					value={logs.length}
					subtitle="entries recorded"
					icon={<TrendIcon />}
					color="red"
				/>
			</div>

			{/* Charts */}
			<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
				<section className="card lg:col-span-2">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
							<TrendIcon />
						</div>
						<div>
							<h2 className="text-xl font-bold text-slate-800">Emission Trends</h2>
							<p className="text-sm text-slate-500">Your carbon footprint over time</p>
						</div>
					</div>
					<div className="h-64">
						{lineData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={lineData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
									<XAxis 
										dataKey="date" 
										hide={lineData.length > 14}
										tick={{ fontSize: 12, fill: '#64748b' }}
									/>
									<YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
									<Tooltip 
										contentStyle={{ 
											backgroundColor: 'white', 
											border: '1px solid #e2e8f0',
											borderRadius: '12px',
											boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
										}}
									/>
									<Line 
										type="monotone" 
										dataKey="total" 
										stroke="#10b981" 
										strokeWidth={3} 
										dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
										activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
									/>
								</LineChart>
							</ResponsiveContainer>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-slate-400">
								<EmptyStateIcon />
								<p className="mt-4 font-medium">No data yet</p>
								<p className="text-sm">Start logging activities to see trends</p>
							</div>
						)}
					</div>
				</section>

				<section className="card">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 rounded-lg bg-blue-100 text-blue-600">
							<BreakdownIcon />
						</div>
						<div>
							<h2 className="text-xl font-bold text-slate-800">Today's Breakdown</h2>
							<p className="text-sm text-slate-500">Emission sources</p>
						</div>
					</div>
					<div className="h-64">
						{pieData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie 
										data={pieData} 
										dataKey="value" 
										nameKey="name" 
										cx="50%" 
										cy="50%" 
										outerRadius={80}
										innerRadius={30}
									>
										{pieData.map((_, idx) => (
											<Cell key={idx} fill={COLORS[idx % COLORS.length]} />
										))}
									</Pie>
									<Tooltip 
										contentStyle={{ 
											backgroundColor: 'white', 
											border: '1px solid #e2e8f0',
											borderRadius: '12px',
											boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-slate-400">
								<EmptyStateIcon />
								<p className="mt-4 font-medium">No data today</p>
								<p className="text-sm">Log today's activity to see breakdown</p>
							</div>
						)}
					</div>
					{pieData.length > 0 && (
						<div className="mt-4 space-y-2">
							{pieData.map((item, idx) => (
								<div key={item.name} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div 
											className="w-3 h-3 rounded-full" 
											style={{ backgroundColor: COLORS[idx % COLORS.length] }}
										></div>
										<span className="text-sm font-medium text-slate-600">{item.name}</span>
									</div>
									<span className="text-sm font-semibold text-slate-800">{item.value} kg</span>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
