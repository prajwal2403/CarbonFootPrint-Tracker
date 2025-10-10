const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Helper function to get auth headers
const getAuthHeaders = () => {
	return {
		'Content-Type': 'application/json'
	};
};

// Helper function to handle API responses
const handleResponse = async (response) => {
	if (!response.ok) {
		const error = await response.json().catch(() => ({ detail: 'Network error' }));
		throw new Error(error.detail || `HTTP ${response.status}`);
	}
	return response.json();
};

// Authentication APIs
export async function register(userData) {
	const res = await fetch(`${BASE_URL}/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userData)
	});
	return handleResponse(res);
}

export async function login(credentials) {
	const res = await fetch(`${BASE_URL}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials)
	});
	return handleResponse(res);
}

// getCurrentUser is no longer needed since we don't use JWT tokens
// User data is returned directly from login endpoint

// Carbon tracking APIs
export async function compute(payload) {
	const res = await fetch(`${BASE_URL}/compute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

export async function createLog(userId, payload) {
	const res = await fetch(`${BASE_URL}/logs/${userId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

export async function listLogs(userId) {
	const res = await fetch(`${BASE_URL}/logs/${userId}`, {
		headers: { 'Content-Type': 'application/json' }
	});
	return handleResponse(res);
}
