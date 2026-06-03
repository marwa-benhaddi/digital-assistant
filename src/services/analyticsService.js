import api from './api'

const unwrap = (response) => response.data?.data || response.data

const toNumber = (value) => Number(value ?? 0)

const normalizeTransaction = (tx) => {
    const amount = toNumber(
        tx.totalPrice ??
        tx.total ??
        tx.amount ??
        tx.totalAmount ??
        0
    )

    return {
        ...tx,
        id: tx.id,
        productName: tx.productName || tx.product?.name || 'Product',
        clientName: tx.clientName || tx.client?.name || '',
        quantity: toNumber(tx.quantity ?? 1),
        amount,
        total: amount,
        totalPrice: amount,
        status: String(tx.status || '').toLowerCase(),
        type: tx.type || 'cash',
        transactionDate: tx.transactionDate || tx.createdAt || tx.created_at || tx.date || '',
        createdAt: tx.createdAt || tx.created_at || tx.transactionDate || tx.date || '',
        created_at: tx.created_at || tx.createdAt || tx.transactionDate || tx.date || '',
    }
}

const getDateRange = (period) => {
    const end = new Date()
    const start = new Date()

    if (period === 'This Month') {
        start.setDate(1)
    } else if (period === 'Last 3 Months') {
        start.setMonth(start.getMonth() - 3)
    } else {
        start.setMonth(0)
        start.setDate(1)
    }

    return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
    }
}

const groupByDay = (transactions) => {
    const grouped = {}

    transactions.forEach((tx) => {
        const rawDate = tx.transactionDate || tx.createdAt || tx.created_at
        const label = rawDate ? rawDate.slice(0, 10) : 'Unknown'

        if (!grouped[label]) {
            grouped[label] = {
                label,
                amount: 0,
                count: 0,
            }
        }

        grouped[label].amount += tx.amount
        grouped[label].count += 1
    })

    return Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label))
}

const groupByMonth = (transactions) => {
    const grouped = {}

    transactions.forEach((tx) => {
        const rawDate = tx.transactionDate || tx.createdAt || tx.created_at
        const date = rawDate ? new Date(rawDate) : new Date()
        const label = date.toLocaleString('en-US', { month: 'short' })

        if (!grouped[label]) {
            grouped[label] = {
                month: label,
                revenue: 0,
                expenses: 0,
            }
        }

        grouped[label].revenue += tx.amount
        grouped[label].expenses += tx.amount * 0.4
    })

    return Object.values(grouped)
}

const groupTopProducts = (transactions, limit = 5) => {
    const grouped = {}

    transactions.forEach((tx) => {
        const name = tx.productName || 'Product'

        if (!grouped[name]) {
            grouped[name] = {
                productName: name,
                name,
                totalRevenue: 0,
                revenue: 0,
                totalSales: 0,
            }
        }

        grouped[name].totalRevenue += tx.amount
        grouped[name].revenue += tx.amount
        grouped[name].totalSales += tx.quantity || 1
    })

    return Object.values(grouped)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit)
}

export const analyticsService = {
    async getTransactionsByPeriod(period = 'This Year') {
        const range = getDateRange(period)

        const response = await api.get('/transactions/range', {
            params: {
                start: range.start,
                end: range.end,
            },
        })

        const data = unwrap(response)
        return Array.isArray(data) ? data.map(normalizeTransaction) : []
    },

    async getMonthlyRevenue(year = new Date().getFullYear()) {
        const response = await api.get('/transactions/range', {
            params: {
                start: `${year}-01-01`,
                end: `${year}-12-31`,
            },
        })

        const data = unwrap(response)
        const transactions = Array.isArray(data) ? data.map(normalizeTransaction) : []

        return groupByMonth(transactions)
    },

    async getSalesChart(days = 30) {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - days)

        const response = await api.get('/transactions/range', {
            params: {
                start: start.toISOString().slice(0, 10),
                end: end.toISOString().slice(0, 10),
            },
        })

        const data = unwrap(response)
        const transactions = Array.isArray(data) ? data.map(normalizeTransaction) : []

        return groupByDay(transactions)
    },

    async getTopProducts(limit = 5) {
        try {
            const response = await api.get('/dashboard/top-products', {
                params: { limit },
            })

            const data = unwrap(response)

            if (Array.isArray(data) && data.length > 0) {
                return data.map((item) => ({
                    ...item,
                    productName: item.productName || item.name || 'Product',
                    name: item.name || item.productName || 'Product',
                    totalRevenue: toNumber(item.totalRevenue ?? item.revenue ?? item.amount),
                    revenue: toNumber(item.revenue ?? item.totalRevenue ?? item.amount),
                    totalSales: toNumber(item.totalSales ?? item.quantity ?? item.count),
                }))
            }
        } catch {
            // fallback below
        }

        const response = await api.get('/transactions')
        const data = unwrap(response)
        const transactions = Array.isArray(data) ? data.map(normalizeTransaction) : []

        return groupTopProducts(transactions, limit)
    },

    async getStats(period = 'This Year') {
        const transactions = await this.getTransactionsByPeriod(period)

        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0)
        const totalExpenses = totalRevenue * 0.4
        const profit = totalRevenue - totalExpenses
        const avgOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0

        return {
            totalRevenue,
            totalExpenses,
            profit,
            avgOrderValue,
            ordersCount: transactions.length,
        }
    },
}

export default analyticsService