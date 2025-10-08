import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../lib/auth'

const AuthContext = createContext(null)

// Custom hook - keep it simple to avoid Fast Refresh issues
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser()
        if (result.success) {
          setUser(result.user)
        } else {
          authService.logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    console.log('AuthContext login called with:', credentials)
    const result = await authService.login(credentials)
    console.log('AuthContext login result:', result)
    if (result.success) {
      console.log('Setting user in AuthContext:', result.user)
      setUser(result.user)
    }
    return result
  }

  const register = async (userData) => {
    const result = await authService.register(userData)
    return result
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Export both the hook and provider
export { useAuth, AuthProvider }