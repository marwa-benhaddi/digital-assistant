import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    AlertTriangle,
    MessageSquare,
    BarChart2,
    Settings,
    Zap,
} from 'lucide-react'
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

export default function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-surface border-r border-border">
            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-white" />
                </div>
                <span className="text-lg font-semibold text-text-primary">{APP_NAME}</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-text-muted">
                    Main Menu
                </p>

                <ul className="flex flex-col gap-0.5">
                    {navItems.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-surface-alt text-primary border border-border'
                                            : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <p className="px-3 mt-5 mb-2 text-2xs font-semibold uppercase tracking-widest text-text-muted">
                    Insights
                </p>

                <ul className="flex flex-col gap-0.5">
                    {navItems.slice(5).map(({ to, icon: Icon, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-surface-alt text-primary border border-border'
                                            : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-border">
                <div className="rounded-xl bg-surface-alt border border-border p-3.5">
                    <p className="text-xs font-semibold text-primary mb-1">Pro Tip</p>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Check stock alerts regularly to avoid stockouts.
                    </p>
                </div>
            </div>
        </aside>
    )
}