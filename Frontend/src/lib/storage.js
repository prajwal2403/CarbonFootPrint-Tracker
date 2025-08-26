const KEY = 'carbon_tracker_logs_v1'

export function loadLogs() {
	try {
		const raw = localStorage.getItem(KEY)
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

export function saveLog(entry) {
	const logs = loadLogs()
	logs.push(entry)
	localStorage.setItem(KEY, JSON.stringify(logs))
	return logs
}

export function clearLogs() {
	localStorage.removeItem(KEY)
}
