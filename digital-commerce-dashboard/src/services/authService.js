import api from './api'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

export const authService = {
    async login(credentials) {
        // result is { success: true, message: "...", data: { accessToken, ownerId, shopName, email } }
        const result = await api.post('/auth/login', credentials)

        // Get the actual data from the nested data property
        const authData = result.data

        if (authData?.accessToken) {
            localStorage.setItem(TOKEN_KEY, authData.accessToken)
            localStorage.setItem(USER_KEY, JSON.stringify({
                id: authData.ownerId,
                email: authData.email,
                shopName: authData.shopName
            }))
            console.log('✅ Token saved successfully!')
        } else {
            console.error('❌ No accessToken in response:', result)
        }

        return authData
    },

    async register(userData) {
        const result = await api.post('/auth/register', userData)
        const ownerData = result.data

        if (ownerData?.email) {
            localStorage.setItem(USER_KEY, JSON.stringify(ownerData))
        }
        return ownerData
    },

    async logout() {
        try {
            await api.post('/auth/logout')
        } finally {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
        }
    },

    async getProfile() {
        const result = await api.get('/auth/me')
        return result.data
    },

    async updateProfile(data) {
        const result = await api.put('/auth/me', data)
        return result.data
    },

    async changePassword(data) {
        const result = await api.put('/auth/password', data)
        return result.data
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