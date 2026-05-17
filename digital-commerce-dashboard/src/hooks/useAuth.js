import { useAuthContext } from '../context/AuthContext'

/**
 * Custom hook to access authentication context
 * Provides user state and auth methods (login, logout, register, etc.)
 */
export function useAuth() {
    return useAuthContext()
}

export default useAuth

// Made with Bob
