import api from './api'

export const dashboardService = {
    /**
     * Get dashboard statistics
     * Returns: { todaySales, weekSales, monthSales, totalClients, totalProducts, lowStockCount, outstandingDebt }
     */
    getStats() {
        return api.get('/dashboard/stats')
    },

    /**
     * Get sales chart data
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
     * Get recent transactions (if endpoint exists)
     * @param {number} limit - Number of transactions
     */
    getRecentTransactions(limit = 8) {
        return api.get('/transactions', { params: { limit, sort: 'createdAt,desc' } })
    },

    /**
     * Get stock alerts (if endpoint exists)
     */
    getStockAlerts() {
        return api.get('/products/low-stock')
    },
}

export default dashboardService