import api from './api'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

const unwrap = (result) => {
    return result?.data?.data || result?.data || result
}

const saveAuthData = (payload) => {
    const token = payload?.accessToken || payload?.token

    if (!token) {
        console.error('No token in auth response:', payload)
        throw new Error('No token returned from server')
    }

    const user = {
        id: payload.ownerId,
        ownerId: payload.ownerId,
        email: payload.email,
        shopName: payload.shopName,
        ownerName: payload.ownerName,
        whatsappNumber: payload.whatsappNumber,
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('auth')

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    return {
        ...payload,
        token,
        user,
    }
}

export const authService = {
    async login(credentials) {
        const result = await api.post('/auth/login', credentials)
        const authData = unwrap(result)

        return saveAuthData(authData)
    },

    async register(userData) {
        const result = await api.post('/auth/register', userData)

        // Register returns OwnerResponse only, not token.
        // So do NOT save auth data here.
        return unwrap(result)
    },

    async logout() {
        try {
            await api.post('/auth/logout')
        } catch {
            // ignore logout API errors
        } finally {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem('auth')
        }
    },

    async getProfile() {
        const result = await api.get('/auth/me')
        return unwrap(result)
    },

    async updateProfile(data) {
        const result = await api.put('/auth/me', data)
        return unwrap(result)
    },

    async changePassword(data) {
        const result = await api.put('/auth/password', data)
        return unwrap(result)
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY)
    },

    getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY)
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    },

    isAuthenticated() {
        return Boolean(this.getToken())
    },
}

export default authService