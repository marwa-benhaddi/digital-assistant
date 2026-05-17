import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 15000,
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Response interceptor — handle auth errors and normalize responses
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            const { status, data } = error.response

            if (status === 401) {
                localStorage.removeItem(TOKEN_KEY)
                window.location.href = '/login'
                return Promise.reject(new Error('Session expired. Please log in again.'))
            }

            if (status === 403) {
                return Promise.reject(new Error('You do not have permission to perform this action.'))
            }

            if (status === 404) {
                return Promise.reject(new Error(data?.message || 'Resource not found.'))
            }

            if (status === 422) {
                const validationErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data?.message || 'Validation failed.'
                return Promise.reject(new Error(validationErrors))
            }

            if (status >= 500) {
                return Promise.reject(new Error('Server error. Please try again later.'))
            }

            return Promise.reject(new Error(data?.message || 'An unexpected error occurred.'))
        }

        if (error.request) {
            return Promise.reject(new Error('Network error. Check your connection.'))
        }

        return Promise.reject(error)
    },
)

export default api