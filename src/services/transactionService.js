import api from './api'

const unwrap = (response) => response.data?.data || response.data

const normalizeTransaction = (tx) => {
    if (!tx) return null

    const amount = Number(
        tx.amount ??
        tx.total ??
        tx.totalPrice ??
        tx.totalAmount ??
        tx.total_amount ??
        tx.grandTotal ??
        0
    )

    const quantity = Number(tx.quantity ?? 0)
    const productName = tx.productName || tx.product?.name || ''
    const clientName = tx.clientName || tx.client?.name || tx.client?.fullName || ''
    const type = tx.type || tx.transactionType || 'cash'
    const status = String(tx.status || '').toLowerCase()

    return {
        ...tx,

        id: tx.id,

        clientId: tx.clientId || tx.client?.id,
        clientName,
        customerName: clientName,

        productName,

        items: tx.items || [
            {
                name: productName,
                productName,
                quantity,
                price: Number(tx.unitPrice ?? 0),
            },
        ],

        itemsCount: quantity,

        type,
        paymentMethod: tx.paymentMethod || tx.payment_method || type,

        status,

        quantity,
        unitPrice: Number(tx.unitPrice ?? 0),

        amount,
        total: amount,
        totalPrice: amount,
        totalAmount: amount,

        notes: tx.notes || tx.description || '',

        createdAt: tx.createdAt || tx.created_at || tx.date || tx.transactionDate || '',
        created_at: tx.created_at || tx.createdAt || tx.date || tx.transactionDate || '',
        transactionDate: tx.transactionDate || tx.createdAt || tx.created_at || tx.date || '',

        updatedAt: tx.updatedAt || tx.updated_at || '',
        updated_at: tx.updated_at || tx.updatedAt || '',
    }
}

const normalizeTransactions = (data) => {
    if (Array.isArray(data)) {
        return data.map(normalizeTransaction)
    }

    if (data?.content && Array.isArray(data.content)) {
        return {
            ...data,
            content: data.content.map(normalizeTransaction),
        }
    }

    if (data?.data && Array.isArray(data.data)) {
        return {
            ...data,
            data: data.data.map(normalizeTransaction),
        }
    }

    return normalizeTransaction(data)
}

export const transactionService = {
    async getTransactions(params = {}) {
        const response = await api.get('/transactions', { params })
        return normalizeTransactions(unwrap(response))
    },

    async getTransaction(id) {
        const response = await api.get(`/transactions/${id}`)
        return normalizeTransactions(unwrap(response))
    },

    async createTransaction(data) {
    const response = await api.post('/transactions/sale', data)
    return normalizeTransactions(unwrap(response))
},

    async createSale(data) {
    const response = await api.post('/transactions/sale', data)
    return normalizeTransactions(unwrap(response))
},

    async updateTransaction(id, data) {
        const response = await api.patch(`/transactions/${id}/status`, null, {
            params: {
                status: data.status || data,
            },
        })

        return unwrap(response)
    },

    async cancelTransaction(id) {
        const response = await api.patch(`/transactions/${id}/status`, null, {
            params: {
                status: 'cancelled',
            },
        })

        return unwrap(response)
    },

    async refundTransaction(id) {
        const response = await api.patch(`/transactions/${id}/status`, null, {
            params: {
                status: 'refunded',
            },
        })

        return unwrap(response)
    },

    async markAsPaid(id) {
        const response = await api.patch(`/transactions/${id}/status`, null, {
            params: {
                status: 'paid',
            },
        })

        return unwrap(response)
    },

    async getDaily(date) {
        const response = await api.get('/transactions/daily', {
            params: { date },
        })

        return normalizeTransactions(unwrap(response))
    },

    async getRange(start, end) {
        const response = await api.get('/transactions/range', {
            params: { start, end },
        })

        return normalizeTransactions(unwrap(response))
    },

    async getByClient(clientId) {
        const response = await api.get(`/transactions/client/${clientId}`)
        return normalizeTransactions(unwrap(response))
    },

    async getByProduct(productId) {
        const response = await api.get(`/transactions/product/${productId}`)
        return normalizeTransactions(unwrap(response))
    },

    async getByStatus(status) {
        const response = await api.get(`/transactions/status/${status}`)
        return normalizeTransactions(unwrap(response))
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

    async exportTransactions(params = {}) {
        const response = await api.get('/transactions', { params })
        return normalizeTransactions(unwrap(response))
    },
}

export default transactionService