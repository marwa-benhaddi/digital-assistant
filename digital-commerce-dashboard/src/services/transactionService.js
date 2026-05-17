import api from './api'

export const transactionService = {
    getTransactions(params = {}) {
        return api.get('/transactions', { params })
    },

    getTransaction(id) {
        return api.get(`/transactions/${id}`)
    },

    createTransaction(data) {
        return api.post('/transactions', data)
    },

    updateTransaction(id, data) {
        return api.put(`/transactions/${id}`, data)
    },

    cancelTransaction(id, reason) {
        return api.post(`/transactions/${id}/cancel`, { reason })
    },

    refundTransaction(id, data) {
        return api.post(`/transactions/${id}/refund`, data)
    },

    exportTransactions(params = {}) {
        return api.get('/transactions/export', {
            params,
            responseType: 'blob',
        })
    },
}

export default transactionService