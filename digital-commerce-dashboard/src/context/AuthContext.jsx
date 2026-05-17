import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => authService.getUser())
    const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const verifyAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const data = await authService.getProfile()
                    setUser(data.user || data)
                    setIsAuthenticated(true)
                } catch {
                    authService.logout()
                    setUser(null)
                    setIsAuthenticated(false)
                }
            }
            setIsLoading(false)
        }
        verifyAuth()
    }, [])

    const login = useCallback(async (credentials) => {
        const data = await authService.login(credentials)
        setUser(data.user)
        setIsAuthenticated(true)
        return data
    }, [])

    const register = useCallback(async (userData) => {
        const data = await authService.register(userData)
        setUser(data.user)
        setIsAuthenticated(true)
        return data
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
        setIsAuthenticated(false)
    }, [])

    const updateUser = useCallback((updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }))
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
    return ctx
}

export default AuthContext