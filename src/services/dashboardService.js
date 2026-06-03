import api from './api'

const unwrap = (response) => response.data?.data || response.data

const toNumber = (value) => Number(value ?? 0)

export const dashboardService = {
    async getStats() {
        const response = await api.get('/dashboard/stats')
        const data = unwrap(response)

        return {
            ...data,

            todaySales: toNumber(data.todaySales ?? data.todayRevenue),
            weekSales: toNumber(data.weekSales ?? data.weekRevenue),
            monthSales: toNumber(data.monthSales ?? data.monthRevenue ?? data.monthlyRevenue),

            monthlyRevenue: toNumber(data.monthlyRevenue ?? data.monthRevenue ?? data.monthSales),
            totalClients: toNumber(data.totalClients ?? data.clientsCount),
            totalProducts: toNumber(data.totalProducts ?? data.productsCount),
            lowStockCount: toNumber(data.lowStockCount ?? data.lowStockItems),
            lowStockItems: toNumber(data.lowStockItems ?? data.lowStockCount),
            outstandingDebt: toNumber(data.outstandingDebt ?? data.totalDebt),
        }
    },

   async getSalesChart(days = 30) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    const formatDate = (date) => date.toISOString().slice(0, 10)

    const response = await api.get('/transactions/range', {
        params: {
            start: formatDate(start),
            end: formatDate(end),
        },
    })

    const data = unwrap(response)

    if (!Array.isArray(data)) return []

    const grouped = {}

    data.forEach((item) => {
        const rawDate =
            item.transactionDate ||
            item.date ||
            item.createdAt ||
            item.created_at

        if (!rawDate) return

        const label = new Date(rawDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
        })

        const amount = Number(
            item.totalPrice ??
            item.amount ??
            item.total ??
            item.totalAmount ??
            0
        )

        grouped[label] = (grouped[label] || 0) + amount
    })

    return Object.entries(grouped).map(([label, amount]) => ({
        label,
        amount,
        revenue: amount,
        count: 1,
    }))
},

    async getTopProducts(limit = 5) {
        const response = await api.get('/dashboard/top-products', {
            params: { limit },
        })

        const data = unwrap(response)

        if (!Array.isArray(data)) return []

        return data.map((item) => ({
            ...item,
            productName: item.productName || item.name || '',
            totalRevenue: Number(item.totalRevenue ?? item.revenue ?? item.amount ?? 0),
            totalSales: Number(item.totalSales ?? item.quantity ?? item.count ?? 0),
        }))
    },

    async getRecentTransactions(limit = 8) {
        const response = await api.get('/transactions', {
            params: { limit },
        })

        const data = unwrap(response)

        if (!Array.isArray(data)) return []

        return data.slice(0, limit)
    },

    async getStockAlerts() {
        const response = await api.get('/products/low-stock')
        const data = unwrap(response)

        return Array.isArray(data) ? data : []
    },

    async getTodayRevenue() {
        const response = await api.get('/transactions/revenue/today')
        return unwrap(response)
    },

    async getWeekRevenue() {
        const response = await api.get('/transactions/revenue/week')
        return unwrap(response)
    },

    async getMonthRevenue() {
        const response = await api.get('/transactions/revenue/month')
        return unwrap(response)
    },
}

export default dashboardService