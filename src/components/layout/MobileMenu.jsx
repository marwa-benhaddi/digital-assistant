import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Package, Users, ShoppingCart, AlertTriangle, MessageSquare, BarChart2, Settings, Zap } from 'lucide-react'
import { ROUTES, APP_NAME } from '../../utils/constants'

const navItems = [
    { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: ROUTES.PRODUCTS, icon: Package, label: 'Products' },
    { to: ROUTES.CLIENTS, icon: Users, label: 'Clients' },
    { to: ROUTES.SALES, icon: ShoppingCart, label: 'Sales' },
    { to: ROUTES.STOCK_ALERTS, icon: AlertTriangle, label: 'Stock Alerts' },
    { to: ROUTES.MESSAGES, icon: MessageSquare, label: 'Messages' },
    { to: ROUTES.ANALYTICS, icon: BarChart2, label: 'Analytics' },
    { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
]

export default function MobileMenu({ isOpen, onClose }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-card-lg flex flex-col animate-slide-in">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                            <Zap size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-semibold text-text-primary">{APP_NAME}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="flex flex-col gap-0.5">
                        {navItems.map(({ to, icon: Icon, label, end }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    end={end}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                                    }
                                >
                                    <Icon size={18} />
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </div>
    )
}