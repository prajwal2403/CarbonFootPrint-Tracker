const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Helper function to get auth headers
const getAuthHeaders = () => {
	const token = localStorage.getItem('token');
	return {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` })
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

export async function getCurrentUser() {
	const res = await fetch(`${BASE_URL}/me`, {
		headers: getAuthHeaders()
	});
	return handleResponse(res);
}

// Carbon tracking APIs
export async function compute(payload) {
	const res = await fetch(`${BASE_URL}/compute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

export async function createLog(payload) {
	const res = await fetch(`${BASE_URL}/logs`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

export async function listLogs() {
	const res = await fetch(`${BASE_URL}/logs`, {
		headers: getAuthHeaders()
	});
	return handleResponse(res);
}
