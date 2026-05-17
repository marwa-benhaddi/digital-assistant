import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Header({ onMenuOpen }) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Signed out successfully')
            navigate(ROUTES.LOGIN)
        } catch {
            toast.error('Failed to sign out')
        }
    }

    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuOpen}
                    className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Search */}
                <div className="hidden sm:flex flex-1 max-w-sm">
                    <div className="relative w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search…"
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface-alt placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 lg:hidden" />

                {/* Right actions */}
                <div className="flex items-center gap-1.5">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
                            className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-border shadow-card-lg animate-slide-in z-50">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                                </div>
                                <div className="p-3 space-y-1">
                                    {[
                                        { title: '3 items are low on stock', time: '5m ago', color: 'bg-amber-400' },
                                        { title: 'New order #4521 received', time: '12m ago', color: 'bg-primary' },
                                        { title: 'Monthly report is ready', time: '1h ago', color: 'bg-secondary' },
                                    ].map((n, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-alt cursor-pointer transition-colors">
                                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color}`} />
                                            <div>
                                                <p className="text-sm text-text-primary">{n.title}</p>
                                                <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-border">
                                    <button className="w-full text-sm text-center text-primary hover:text-primary-dark font-medium transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false) }}
                            className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-surface-alt transition-colors"
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
                                {getInitials(user?.name || 'User')}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[100px] truncate">
                {user?.name || 'User'}
              </span>
                            <ChevronDown size={14} className="text-text-muted" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-border shadow-card-lg animate-slide-in z-50">
                                <div className="p-3 border-b border-border">
                                    <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                </div>
                                <div className="p-1.5">
                                    <button
                                        onClick={() => { setShowUserMenu(false); navigate(ROUTES.SETTINGS) }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary rounded-xl hover:bg-surface-alt hover:text-text-primary transition-colors"
                                    >
                                        <User size={15} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => { setShowUserMenu(false); navigate(ROUTES.SETTINGS) }}
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

            {/* Click outside handler */}
            {(showUserMenu || showNotifications) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setShowUserMenu(false); setShowNotifications(false) }}
                />
            )}
        </header>
    )
}