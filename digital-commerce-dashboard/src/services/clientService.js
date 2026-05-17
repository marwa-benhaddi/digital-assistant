import api from './api'

export const clientService = {
    getClients(params = {}) {
        return api.get('/clients', { params })
    },

    getClient(id) {
        return api.get(`/clients/${id}`)
    },

    createClient(data) {
        return api.post('/clients', data)
    },

    updateClient(id, data) {
        return api.put(`/clients/${id}`, data)
    },

    deleteClient(id) {
        return api.delete(`/clients/${id}`)
    },

    getClientDebts(id) {
        return api.get(`/clients/${id}/debts`)
    },

    getClientTransactions(id, params = {}) {
        return api.get(`/clients/${id}/transactions`, { params })
    },

    recordDebtPayment(clientId, debtId, amount) {
        return api.post(`/clients/${clientId}/debts/${debtId}/payment`, { amount })
    },

    getTopDebtors(limit = 5) {
        return api.get('/clients/top-debtors', { params: { limit } })
    },
}

export default clientService