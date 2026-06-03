import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

function normalizeUser(data) {
    const user = data?.data || data?.user || data

    if (!user) return null

    return {
        id: user.id || user.ownerId,
        ownerId: user.ownerId || user.id,
        ownerName: user.ownerName || user.name || '',
        name: user.ownerName || user.name || user.shopName || '',
        email: user.email || '',
        shopName: user.shopName || '',
        whatsappNumber: user.whatsappNumber || '',
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => authService.getUser())
    const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const verifyAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const profile = await authService.getProfile()
                    const normalizedUser = normalizeUser(profile)

                    setUser(normalizedUser)
                    setIsAuthenticated(true)
                } catch (error) {
                    await authService.logout()
                    setUser(null)
                    setIsAuthenticated(false)
                }
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }

            setIsLoading(false)
        }

        verifyAuth()
    }, [])

    const login = useCallback(async (credentials) => {
        const loginData = await authService.login(credentials)

        try {
            const profile = await authService.getProfile()
            const normalizedUser = normalizeUser(profile)

            setUser(normalizedUser)
        } catch (error) {
            const normalizedUser = normalizeUser(loginData)
            setUser(normalizedUser)
        }

        setIsAuthenticated(true)
        return loginData
    }, [])

    const register = useCallback(async (userData) => {
        const registerData = await authService.register(userData)

        const normalizedUser = normalizeUser(registerData)
        setUser(normalizedUser)
        setIsAuthenticated(true)

        return registerData
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
        setIsAuthenticated(false)
    }, [])

    const updateUser = useCallback((updatedUser) => {
        setUser((prev) => {
            const nextUser = normalizeUser({
                ...prev,
                ...updatedUser,
            })

            return nextUser
        })
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)

    if (!ctx) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }

    return ctx
}

export default AuthContext