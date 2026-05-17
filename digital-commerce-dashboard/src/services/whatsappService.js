import api from './api'

export const whatsappService = {
    /**
     * Get all WhatsApp messages
     */
    getAllMessages(params = {}) {
        return api.get('/whatsapp/messages', { params })
    },

    /**
     * Get all WhatsApp conversations
     */
    getConversations(params = {}) {
        return api.get('/whatsapp/conversations', { params })
    },

    /**
     * Get messages for a specific conversation
     * @param {string} conversationId - Conversation ID or phone number
     */
    getMessages(conversationId, params = {}) {
        return api.get(`/whatsapp/conversations/${conversationId}/messages`, { params })
    },

    /**
     * Send a WhatsApp message
     * @param {string} to - Recipient phone number
     * @param {string} message - Message text
     */
    sendMessage(to, message) {
        return api.post('/whatsapp/send', { to, message })
    },

    /**
     * Mark conversation as read
     * @param {string} conversationId - Conversation ID
     */
    markAsRead(conversationId) {
        return api.post(`/whatsapp/conversations/${conversationId}/read`)
    },
}

export default whatsappService

// Made with Bob
