const API_BASE_URL = 'http://localhost:8000';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async register(userData) {
    try {
      console.log('Attempting to register with:', API_BASE_URL, userData);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.log('Register error:', error);
        throw new Error(error.detail || 'Registration failed');
      }

      const user = await response.json();
      console.log('Registration successful:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async login(credentials) {
    try {
      console.log('Attempting to login with:', API_BASE_URL, credentials);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('Login error:', error);
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store token and user data
      this.token = data.access_token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      return { success: true, user: this.user, token: this.token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return this.token !== null;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  }

  async getCurrentUser() {
    if (!this.token) {
      return { success: false, error: 'No token available' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired');
        }
        throw new Error('Failed to get current user');
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();