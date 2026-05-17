import api from './api'

export const analyticsService = {
    /**
     * Get monthly revenue data
     * @param {number} year - Year (default: current year)
     * Returns: Array of { month, revenue }
     */
    getMonthlyRevenue(year = new Date().getFullYear()) {
        return api.get('/dashboard/monthly-revenue', { params: { year } })
    },

    /**
     * Get sales chart data for analytics
     * @param {number} days - Number of days (default: 30)
     * Returns: Array of { label, amount, count }
     */
    getSalesChart(days = 30) {
        return api.get('/dashboard/sales-chart', { params: { days } })
    },

    /**
     * Get top products by revenue
     * @param {number} limit - Number of products (default: 5)
     * Returns: Array of { productName, totalRevenue, totalSales }
     */
    getTopProducts(limit = 5) {
        return api.get('/dashboard/top-products', { params: { limit } })
    },

    /**
     * Get transactions within a date range
     * @param {string} start - Start date (ISO format)
     * @param {string} end - End date (ISO format)
     */
    getTransactionsByDateRange(start, end) {
        return api.get('/transactions/range', { params: { start, end } })
    },

    /**
     * Get dashboard statistics
     */
    getStats() {
        return api.get('/dashboard/stats')
    },
}

export default analyticsService

// Made with Bob
