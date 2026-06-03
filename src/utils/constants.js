// Application Info
export const APP_NAME = 'CommerceHub'

// Application Routes
export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/',
    PRODUCTS: '/products',
    CLIENTS: '/clients',
    SALES: '/sales',
    STOCK_ALERTS: '/stock-alerts',
    MESSAGES: '/messages',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings',
    FORGOT_PASSWORD: '/forgot-password',
VERIFY_RESET_CODE: '/verify-reset-code',
SET_PASSWORD: '/set-password',
}

// API Configuration
export const API_BASE_URL =   'http://localhost:8080/api' ||  "https://landmine-paralysis-truffle.ngrok-free.dev" 

// LocalStorage Keys
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

// Chart Colors for data visualization
export const CHART_COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
]

// Product Categories
export const PRODUCT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Beauty',
    'Toys & Games',
    'Automotive',
    'Office Supplies',
    'Other',
]

// Transaction Statuses
export const TRANSACTION_STATUSES = {
    COMPLETED: 'completed',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
}

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    MOBILE: 'mobile_money',
    BANK: 'bank_transfer',
}

// Status Badge Colors
export const STATUS_COLORS = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    refunded: 'info',
}

// Pagination Defaults
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Stock Alert Threshold
export const LOW_STOCK_THRESHOLD = 10

// Date Format
export const DATE_FORMAT = 'MMM dd, yyyy'
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm'

// Made with Bob
