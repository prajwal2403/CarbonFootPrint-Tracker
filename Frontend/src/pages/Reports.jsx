import { useEffect, useState } from 'react'
import { listLogs } from '../lib/api'

// Icon components
const HistoryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const EmptyIcon = () => (
  <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4">
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, value, subtitle, change, icon }) {
  const isPositive = change > 0
  return (
    <div className="card-gradient">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
            {isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  )
}

export default function Reports() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	const [sortBy, setSortBy] = useState('date')
	const [sortOrder, setSortOrder] = useState('desc')

	useEffect(() => {
		setLoading(true)
		listLogs()
			.then(data => setLogs((data.items || []).slice().reverse()))
			.catch(() => setLogs([]))
			.finally(() => setLoading(false))
	}, [])

	// Calculate statistics
	const totalEmissions = logs.reduce((sum, log) => sum + log.totalKg, 0)
	const averageEmissions = logs.length > 0 ? totalEmissions / logs.length : 0
	const highestDay = logs.reduce((max, log) => log.totalKg > max.totalKg ? log : max, { totalKg: 0 })
	const lowestDay = logs.reduce((min, log) => log.totalKg < min.totalKg ? log : min, { totalKg: Infinity })

	// Calculate week-over-week change
	const lastWeekLogs = logs.slice(0, 7)
	const previousWeekLogs = logs.slice(7, 14)
	const lastWeekAvg = lastWeekLogs.length > 0 ? lastWeekLogs.reduce((sum, log) => sum + log.totalKg, 0) / lastWeekLogs.length : 0
	const previousWeekAvg = previousWeekLogs.length > 0 ? previousWeekLogs.reduce((sum, log) => sum + log.totalKg, 0) / previousWeekLogs.length : 0
	const weeklyChange = previousWeekAvg > 0 ? ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100 : 0

	// Sort logs
	const sortedLogs = [...logs].sort((a, b) => {
		let aVal = a[sortBy]
		let bVal = b[sortBy]
		
		if (sortBy === 'date') {
			aVal = new Date(aVal)
			bVal = new Date(bVal)
		}
		
		if (sortOrder === 'asc') {
			return aVal > bVal ? 1 : -1
		} else {
			return aVal < bVal ? 1 : -1
		}
	})

	const handleSort = (column) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
		} else {
			setSortBy(column)
			setSortOrder('desc')
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<LoadingSkeleton />
			</div>
		)
	}

	if (logs.length === 0) {
		return (
			<div className="card text-center py-16">
				<EmptyIcon />
				<h3 className="text-xl font-semibold text-slate-600 mt-4">No data yet</h3>
				<p className="text-slate-500 mt-2">Start logging your daily activities to see reports and trends</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Statistics Overview */}
			<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<StatCard 
					title="Total Emissions" 
					value={`${totalEmissions.toFixed(1)} kg`}
					subtitle="All time cumulative"
					icon={<HistoryIcon />}
				/>
				<StatCard 
					title="Daily Average" 
					value={`${averageEmissions.toFixed(1)} kg`}
					subtitle="Per day average"
					change={weeklyChange}
					icon={<HistoryIcon />}
				/>
				<StatCard 
					title="Highest Day" 
					value={`${highestDay.totalKg} kg`}
					subtitle={highestDay.date}
					icon={<HistoryIcon />}
				/>
				<StatCard 
					title="Lowest Day" 
					value={`${lowestDay.totalKg === Infinity ? 0 : lowestDay.totalKg} kg`}
					subtitle={lowestDay.totalKg === Infinity ? 'N/A' : lowestDay.date}
					icon={<HistoryIcon />}
				/>
			</div>

			{/* History Table */}
			<div className="card">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
						<HistoryIcon />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-slate-800">Activity History</h2>
						<p className="text-slate-500">Complete log of your carbon footprint</p>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-slate-200">
								{[
									{ key: 'date', label: 'Date' },
									{ key: 'travelKg', label: 'Travel (kg)' },
									{ key: 'electricityKg', label: 'Electricity (kg)' },
									{ key: 'foodKg', label: 'Food (kg)' },
									{ key: 'totalKg', label: 'Total (kg)' }
								].map(({ key, label }) => (
									<th 
										key={key}
										className="text-left py-4 px-4 font-semibold text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
										onClick={() => handleSort(key)}
									>
										<div className="flex items-center gap-2">
											{label}
											{sortBy === key && (
												<div className="text-emerald-600">
													{sortOrder === 'asc' ? <TrendUpIcon /> : <TrendDownIcon />}
												</div>
											)}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sortedLogs.map((log, idx) => (
								<tr 
									key={idx} 
									className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
								>
									<td className="py-4 px-4 font-medium text-slate-700">{log.date}</td>
									<td className="py-4 px-4 text-slate-600">{log.travelKg}</td>
									<td className="py-4 px-4 text-slate-600">{log.electricityKg}</td>
									<td className="py-4 px-4 text-slate-600">{log.foodKg}</td>
									<td className="py-4 px-4 font-bold text-slate-800">{log.totalKg}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{sortedLogs.length > 10 && (
					<div className="mt-6 text-center">
						<p className="text-sm text-slate-500">
							Showing {sortedLogs.length} entries total
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
