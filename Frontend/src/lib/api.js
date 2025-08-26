const BASE_URL = import.meta.env.VITE_API_URL || 'http://16.170.244.162:8000'

export async function compute(payload) {
	const res = await fetch(`${BASE_URL}/compute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	})
	if (!res.ok) throw new Error('Compute failed')
	return res.json()
}

export async function createLog(payload) {
	const res = await fetch(`${BASE_URL}/logs`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	})
	if (!res.ok) throw new Error('Create log failed')
	return res.json()
}

export async function listLogs() {
	const res = await fetch(`${BASE_URL}/logs`)
	if (!res.ok) throw new Error('List logs failed')
	return res.json()
}
