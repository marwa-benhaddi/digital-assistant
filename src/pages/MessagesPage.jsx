import { useState, useEffect } from 'react'
import { MessageSquare, RefreshCw, Phone, Calendar } from 'lucide-react'
import { formatDate } from '../utils/formatters'
import whatsappService from '../services/whatsappService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Badge from '../components/common/Badge'

export default function MessagesPage() {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadMessages()
    }, [])

    const loadMessages = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await whatsappService.getAllMessages()
            
            // Handle different response formats
            let messagesData = []
            if (Array.isArray(response)) {
                messagesData = response
            } else if (response.data && Array.isArray(response.data)) {
                messagesData = response.data
            } else if (response.success && Array.isArray(response.data)) {
                messagesData = response.data
            }
            
            // Sort by receivedAt descending (newest first)
            messagesData.sort((a, b) => {
                const dateA = new Date(a.receivedAt || 0)
                const dateB = new Date(b.receivedAt || 0)
                return dateB - dateA
            })
            
            setMessages(messagesData)
        } catch (err) {
            console.error('Failed to load messages:', err)
            setError(err.message || 'Failed to load messages.')
        } finally {
            setIsLoading(false)
        }
    }

    const getDirectionBadge = (direction) => {
        if (direction === 'INBOUND' || direction === 'inbound') {
            return <Badge variant="info">Received</Badge>
        } else if (direction === 'OUTBOUND' || direction === 'outbound') {
            return <Badge variant="success">Sent</Badge>
        }
        return <Badge variant="default">{direction || 'Unknown'}</Badge>
    }

    const getIntentBadge = (intent) => {
        if (!intent) return null
        
        const intentColors = {
            PRODUCT_INQUIRY: 'info',
            ORDER_PLACEMENT: 'success',
            PAYMENT_CONFIRMATION: 'success',
            COMPLAINT: 'error',
            GENERAL: 'default',
        }
        
        const variant = intentColors[intent] || 'default'
        const label = intent.replace(/_/g, ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        
        return <Badge variant={variant}>{label}</Badge>
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="page-title">Messages</h1>
                    <p className="text-sm text-text-muted mt-1">WhatsApp messages from clients</p>
                </div>
                <ErrorMessage message={error} onRetry={loadMessages} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Messages</h1>
                    <p className="text-sm text-text-muted mt-1">WhatsApp messages from clients</p>
                </div>
                <button
                    onClick={loadMessages}
                    disabled={isLoading}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="card">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare size={48} className="text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No messages yet</h3>
                        <p className="text-sm text-text-muted">
                            WhatsApp messages from clients will appear here
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Sender
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Direction
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Intent
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Received
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {messages.map((message) => (
                                    <tr key={message.id} className="hover:bg-surface-alt transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-text-muted" />
                                                <span className="text-sm font-medium text-text-primary">
                                                    {message.senderNumber || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-text-primary line-clamp-2 max-w-md">
                                                {message.messageText || 'No message text'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getDirectionBadge(message.direction)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getIntentBadge(message.intent)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {message.processed ? (
                                                <Badge variant="success">Processed</Badge>
                                            ) : (
                                                <Badge variant="warning">Pending</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <Calendar size={14} />
                                                {message.receivedAt ? formatDate(message.receivedAt) : 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!isLoading && messages.length > 0 && (
                <div className="text-sm text-text-muted text-center">
                    Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    )
}

// Made with Bob
