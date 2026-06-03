import api from './api'

export const productService = {
    getProducts(params = {}) {
        return api.get('/products', { params })
    },

    getProduct(id) {
        return api.get(`/products/${id}`)
    },

    createProduct(data) {
        return api.post('/products', data)
    },

    updateProduct(id, data) {
        return api.put(`/products/${id}`, data)
    },

    deleteProduct(id) {
        return api.delete(`/products/${id}`)
    },

    getLowStockProducts(threshold = 10) {
        return api.get('/products/low-stock', { params: { threshold } })
    },

    updateStock(id, quantity) {
        return api.patch(`/products/${id}/stock`, { quantity })
    },

    getCategories() {
        return api.get('/products/categories')
    },

    getStockAlerts() {
        return api.get('/stock-alerts')
    },
}

export default productService