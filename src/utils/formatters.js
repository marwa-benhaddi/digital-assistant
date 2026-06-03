import { getPreferences } from './preferences'

/**
 * Format a number as currency
 */
export const formatCurrency = (amount, currency, locale = 'en-US') => {
    if (amount === null || amount === undefined || isNaN(amount)) return '—'

    const prefs = getPreferences()
    const selectedCurrency = currency || prefs.currency || 'MAD'

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: selectedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount))
}

/**
 * Format a number with commas
 */
export const formatNumber = (num, locale = 'en-US') => {
    if (num === null || num === undefined || isNaN(num)) return '—'
    return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format a percentage
 */
export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '—'
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(decimals)}%`
}

const pad = (value) => String(value).padStart(2, '0')

const formatDateByPreference = (date, includeTime = false) => {
    const { dateFormat } = getPreferences()

    const day = pad(date.getDate())
    const month = pad(date.getMonth() + 1)
    const year = date.getFullYear()

    let formattedDate

    if (dateFormat === 'DD/MM/YYYY') {
        formattedDate = `${day}/${month}/${year}`
    } else if (dateFormat === 'YYYY-MM-DD') {
        formattedDate = `${year}-${month}-${day}`
    } else {
        formattedDate = `${month}/${day}/${year}`
    }

    if (!includeTime) return formattedDate

    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())

    return `${formattedDate} ${hours}:${minutes}`
}

/**
 * Format a date string
 */
export const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return '—'

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '—'

    if (Object.keys(options).length > 0) {
        return date.toLocaleDateString('en-US', options)
    }

    return formatDateByPreference(date, false)
}

/**
 * Format a datetime string
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '—'

    return formatDateByPreference(date, true)
}

/**
 * Format a relative time string
 */
export const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—'

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return formatDate(dateStr)
}

/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 40) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return `${text.slice(0, maxLength)}...`
}

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Get initials from a full name
 */
export const getInitials = (name = '') => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
}

/**
 * Capitalize the first letter
 */
export const capitalize = (str = '') => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}