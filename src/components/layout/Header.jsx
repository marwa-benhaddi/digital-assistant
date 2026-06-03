import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getInitials, formatRelativeTime } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'
import productService from '../../services/productService'
import transactionService from '../../services/transactionService'
import whatsappService from '../../services/whatsappService'
import toast from 'react-hot-toast'

export default function Header({ onMenuOpen }) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [notificationsSeen, setNotificationsSeen] = useState(() => {
    return localStorage.getItem('notificationsSeen') === 'true'
})
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
    const [globalSearch, setGlobalSearch] = useState('')

    const displayName = user?.ownerName || user?.shopName || user?.name || 'User'

    const normalizeList = (response) => {
        if (Array.isArray(response)) return response
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.content)) return response.content
        return []
    }

    const loadNotifications = useCallback(async () => {
        setIsLoadingNotifications(true)

        const items = []

        try {
            const lowStockResponse = productService.getLowStockProducts
                ? await productService.getLowStockProducts()
                : await productService.getLowStock()

            const rawLowStock = normalizeList(lowStockResponse)

            const lowStock = rawLowStock.filter((product) => {
                const stock = Number(product.stock ?? product.currentStock ?? 0)
                const minStock = Number(product.minStock ?? product.criticalStockThreshold ?? 5)
                const isActive = product.isActive ?? product.active ?? true

                return isActive && stock > 0 && stock <= minStock
            })

            if (lowStock.length > 0) {
                items.push({
                    id: 'low-stock',
                    title: `${lowStock.length} item${lowStock.length > 1 ? 's' : ''} are low on stock`,
                    subtitle: lowStock.slice(0, 2).map((p) => p.name).join(', '),
                    time: 'now',
                    color: 'bg-amber-400',
                    route: ROUTES.STOCK_ALERTS,
                })
            }
        } catch (error) {
            console.warn('Failed to load low stock notifications:', error)
        }

        try {
            const txResponse = await transactionService.getTransactions()
            const transactions = normalizeList(txResponse)

            if (transactions.length > 0) {
                const latest = transactions[0]
                const date =
                    latest.created_at ||
                    latest.createdAt ||
                    latest.transactionDate ||
                    latest.date

                items.push({
                    id: `transaction-${latest.id}`,
                    title: `Latest order #${latest.id}`,
                    subtitle: latest.productName || latest.items?.[0]?.name || 'Sale transaction',
                    time: date ? formatRelativeTime(date) : 'recently',
                    color: 'bg-primary',
                    route: ROUTES.SALES,
                })
            }

            const pendingCount = transactions.filter(
                (tx) => String(tx.status || '').toLowerCase() === 'pending'
            ).length

            if (pendingCount > 0) {
                items.push({
                    id: 'pending-transactions',
                    title: `${pendingCount} pending order${pendingCount > 1 ? 's' : ''}`,
                    subtitle: 'Needs payment follow-up',
                    time: 'now',
                    color: 'bg-orange-400',
                    route: ROUTES.SALES,
                })
            }
        } catch (error) {
            console.warn('Failed to load transaction notifications:', error)
        }

        try {
            const messagesResponse = await whatsappService.getAllMessages()
            const messages = normalizeList(messagesResponse)

            const unprocessed = messages.filter((m) => !m.processed)

            if (unprocessed.length > 0) {
                const latestMessage = unprocessed[0]
                const date = latestMessage.receivedAt || latestMessage.createdAt

                items.push({
                    id: 'whatsapp-messages',
                    title: `${unprocessed.length} WhatsApp message${unprocessed.length > 1 ? 's' : ''} pending`,
                    subtitle: latestMessage.messageText || 'Client message',
                    time: date ? formatRelativeTime(date) : 'now',
                    color: 'bg-secondary',
                    route: ROUTES.MESSAGES,
                })
            }
        } catch (error) {
            console.warn('Failed to load message notifications:', error)
        }

        setNotifications(items)
        setIsLoadingNotifications(false)
    }, [])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    useEffect(() => {
        const refresh = () => {
            loadNotifications()
        }

        window.addEventListener('focus', refresh)
        window.addEventListener('notifications-refresh', refresh)

        return () => {
            window.removeEventListener('focus', refresh)
            window.removeEventListener('notifications-refresh', refresh)
        }
    }, [loadNotifications])

    const handleGlobalSearch = (e) => {
        e.preventDefault()

        const query = globalSearch.trim()
        if (!query) return

        const lower = query.toLowerCase()

        setShowUserMenu(false)
        setShowNotifications(false)

        if (
            lower.includes('client') ||
            lower.includes('customer') ||
            lower.includes('phone')
        ) {
            navigate(`${ROUTES.CLIENTS}?search=${encodeURIComponent(query)}`)
            return
        }

        if (
            lower.includes('sale') ||
            lower.includes('order') ||
            lower.includes('transaction') ||
            lower.startsWith('#')
        ) {
            navigate(`${ROUTES.SALES}?search=${encodeURIComponent(query.replace('#', ''))}`)
            return
        }

        if (
            lower.includes('stock') ||
            lower.includes('alert') ||
            lower.includes('low')
        ) {
            navigate(ROUTES.STOCK_ALERTS)
            return
        }

        navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`)
    }

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Signed out successfully')
            navigate(ROUTES.LOGIN)
        } catch {
            toast.error('Failed to sign out')
        }
    }

    const handleNotificationClick = (notification) => {
        setShowNotifications(false)

        if (notification.route) {
            navigate(notification.route)
        }
    }

const hasNotifications = notifications.length > 0 && !notificationsSeen

    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
                <button
                    onClick={onMenuOpen}
                    className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                >
                    <Menu size={20} />
                </button>

                <form onSubmit={handleGlobalSearch} className="hidden sm:flex flex-1 max-w-sm">
                    <div className="relative w-full">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />

                        <input
                            type="text"
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            placeholder="Search products, clients, orders…"
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface-alt placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </form>

                <div className="flex-1 lg:hidden" />

                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <button
                            onClick={() => {
    setShowNotifications((v) => !v)
    setShowUserMenu(false)
    setNotificationsSeen(true)
localStorage.setItem('notificationsSeen', 'true')
    loadNotifications()
}}
                            className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                        >
                            <Bell size={20} />

                            {hasNotifications && (
                                <>
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                </>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-border shadow-card-lg animate-slide-in z-50">
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <h3 className="font-semibold text-text-primary">Notifications</h3>

                                    <button
                                        onClick={loadNotifications}
                                        className="text-xs text-primary hover:text-primary-dark font-medium"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
                                    {isLoadingNotifications ? (
                                        <p className="text-sm text-text-muted text-center py-6">
                                            Loading notifications...
                                        </p>
                                    ) : notifications.length === 0 ? (
                                        <p className="text-sm text-text-muted text-center py-6">
                                            No notifications
                                        </p>
                                    ) : (
                                        notifications.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-alt cursor-pointer transition-colors"
                                            >
                                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`} />

                                                <div className="min-w-0">
                                                    <p className="text-sm text-text-primary truncate">
                                                        {n.title}
                                                    </p>

                                                    {n.subtitle && (
                                                        <p className="text-xs text-text-muted mt-0.5 truncate">
                                                            {n.subtitle}
                                                        </p>
                                                    )}

                                                    <p className="text-xs text-text-muted mt-0.5">
                                                        {n.time}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="p-3 border-t border-border">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(false)
                                            navigate(ROUTES.STOCK_ALERTS)
                                        }}
                                        className="w-full text-sm text-center text-primary hover:text-primary-dark font-medium transition-colors"
                                    >
                                        View stock alerts
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowUserMenu((v) => !v)
                                setShowNotifications(false)
                            }}
                            className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-surface-alt transition-colors"
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
                                {getInitials(displayName)}
                            </div>

                            <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[100px] truncate">
                                {displayName}
                            </span>

                            <ChevronDown size={14} className="text-text-muted" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-border shadow-card-lg animate-slide-in z-50">
                                <div className="p-3 border-b border-border">
                                    <p className="text-sm font-semibold text-text-primary truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="p-1.5">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            navigate(ROUTES.SETTINGS)
                                        }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary rounded-xl hover:bg-surface-alt hover:text-text-primary transition-colors"
                                    >
                                        <User size={15} />
                                        Profile
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false)
                                            navigate(ROUTES.SETTINGS)
                                        }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary rounded-xl hover:bg-surface-alt hover:text-text-primary transition-colors"
                                    >
                                        <Settings size={15} />
                                        Settings
                                    </button>
                                </div>

                                <div className="p-1.5 border-t border-border">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={15} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(showUserMenu || showNotifications) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowUserMenu(false)
                        setShowNotifications(false)
                    }}
                />
            )}
        </header>
    )
}