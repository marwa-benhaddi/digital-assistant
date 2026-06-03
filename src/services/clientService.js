import api from './api'

const unwrap = (response) => response.data?.data || response.data

const normalizeClient = (client) => {
    if (!client) return null

    const totalDebt = Number(client.totalDebt ?? client.debt ?? client.balance ?? 0)

    return {
        ...client,
        id: client.id,
        name: client.name || client.fullName || '',
        fullName: client.fullName || client.name || '',
        email: client.email || '',
        phone: client.phone || client.whatsappNumber || '',
        address: client.address || '',

        totalDebt,
        debt: totalDebt,
        balance: totalDebt,
        totalSpent: Number(client.totalSpent ?? client.totalRevenue ?? 0),

        isActive: client.isActive ?? client.active ?? true,

        createdAt: client.createdAt || client.created_at || '',
        updatedAt: client.updatedAt || client.updated_at || '',
        created_at: client.created_at || client.createdAt || '',
        updated_at: client.updated_at || client.updatedAt || '',
    }
}

const normalizeClients = (data) => {
    if (Array.isArray(data)) {
        return data.map(normalizeClient)
    }

    if (data?.content && Array.isArray(data.content)) {
        return {
            ...data,
            content: data.content.map(normalizeClient),
        }
    }

    if (data?.data && Array.isArray(data.data)) {
        return {
            ...data,
            data: data.data.map(normalizeClient),
        }
    }

    return normalizeClient(data)
}

const prepareClientPayload = (client) => ({
    name: client.name || client.fullName,
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    notes: client.notes || '',
})

export const clientService = {
    async getClients(params = {}) {
        const response = await api.get('/clients', { params })
        return normalizeClients(unwrap(response))
    },

    async getClient(id) {
        const response = await api.get(`/clients/${id}`)
        return normalizeClients(unwrap(response))
    },

    async createClient(data) {
        const response = await api.post('/clients', prepareClientPayload(data))
        return normalizeClients(unwrap(response))
    },

    async updateClient(id, data) {
        const response = await api.put(`/clients/${id}`, prepareClientPayload(data))
        return normalizeClients(unwrap(response))
    },

    async deleteClient(id) {
        const response = await api.delete(`/clients/${id}`)
        return unwrap(response)
    },

    async searchClients(keyword) {
        const response = await api.get('/clients/search', {
            params: { keyword },
        })
        return normalizeClients(unwrap(response))
    },

    async getTopDebtors(limit = 5) {
        const response = await api.get('/clients/top-debtors', {
            params: { limit },
        })
        return normalizeClients(unwrap(response))
    },

    async getClientDebts(id) {
        // Backend عندك ما ذكرش /clients/{id}/debts
        // خليه مؤقتاً يرجع client debt فقط باش page ما تطيحش
        const client = await this.getClient(id)
        return [{
            id: client.id,
            clientId: client.id,
            amount: client.totalDebt || 0,
            status: client.totalDebt > 0 ? 'pending' : 'paid',
        }]
    },

    async getClientTransactions(id, params = {}) {
        // Backend عندك transactions endpoint هو /transactions/client/{clientId}
        const response = await api.get(`/transactions/client/${id}`, { params })
        return unwrap(response)
    },

    async recordDebtPayment(clientId, debtId, amount) {
        // Backend عندك: POST /api/credits/payment
        const response = await api.post('/credits/payment', {
            clientId,
            debtId,
            amount,
        })
        return unwrap(response)
    },
}

export default clientService