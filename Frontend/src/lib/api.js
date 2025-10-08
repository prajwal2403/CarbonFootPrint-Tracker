import authService from './auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getAuthHeaders() {
	return authService.getAuthHeaders()
}

function handleAuthError(response) {
	if (response.status === 401) {
		authService.logout()
		window.location.href = '/login'
	}
}

export async function compute(payload) {
	const res = await fetch(`${BASE_URL}/compute`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	})
	if (!res.ok) {
		handleAuthError(res)
		throw new Error('Compute failed')
	}
	return res.json()
}

export async function createLog(payload) {
	const res = await fetch(`${BASE_URL}/logs`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	})
	if (!res.ok) {
		handleAuthError(res)
		throw new Error('Create log failed')
	}
	return res.json()
}

export async function listLogs() {
	const res = await fetch(`${BASE_URL}/logs`, {
		headers: getAuthHeaders()
	})
	if (!res.ok) {
		handleAuthError(res)
		throw new Error('List logs failed')
	}
	return res.json()
}
