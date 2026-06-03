import { useState, useEffect } from 'react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { CHART_COLORS } from '../utils/constants'
import analyticsService from '../services/analyticsService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const COLORS = Array.isArray(CHART_COLORS) ? CHART_COLORS : Object.values(CHART_COLORS)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    return (
        <div className="bg-white border border-border rounded-xl shadow-card-md px-4 py-3 text-sm">
            <p className="font-semibold text-text-primary mb-2">{label}</p>

            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-text-muted capitalize">{p.dataKey}:</span>
                    <span className="font-medium">
                        {['revenue', 'expenses', 'amount', 'value'].includes(p.dataKey)
                            ? formatCurrency(p.value)
                            : p.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

const periods = ['This Month', 'Last 3 Months', 'This Year']

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('This Year')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const [revenueData, setRevenueData] = useState([])
    const [salesChartData, setSalesChartData] = useState([])
    const [topProducts, setTopProducts] = useState([])

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        avgOrderValue: 0,
    })

    useEffect(() => {
        loadAnalyticsData()
    }, [period])

    const getDaysFromPeriod = (value) => {
        if (value === 'This Month') return 30
        if (value === 'Last 3 Months') return 90
        return 365
    }

    const loadAnalyticsData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const currentYear = new Date().getFullYear()
            const days = getDaysFromPeriod(period)

            const [monthlyRevenueRes, salesChartRes, topProductsRes, statsRes] =
                await Promise.allSettled([
                    analyticsService.getMonthlyRevenue(currentYear),
                    analyticsService.getSalesChart(days),
                    analyticsService.getTopProducts(5),
                    analyticsService.getStats(period),
                ])

            if (monthlyRevenueRes.status === 'fulfilled') {
                setRevenueData(Array.isArray(monthlyRevenueRes.value) ? monthlyRevenueRes.value : [])
            } else {
                console.error('Failed monthly revenue:', monthlyRevenueRes.reason)
                setRevenueData([])
            }

            if (salesChartRes.status === 'fulfilled') {
                setSalesChartData(Array.isArray(salesChartRes.value) ? salesChartRes.value : [])
            } else {
                console.error('Failed sales chart:', salesChartRes.reason)
                setSalesChartData([])
            }

            if (topProductsRes.status === 'fulfilled') {
                const data = Array.isArray(topProductsRes.value) ? topProductsRes.value : []

                setTopProducts(data.map((item) => ({
                    name: item.productName || item.name || 'Product',
                    value: Number(item.totalRevenue ?? item.revenue ?? item.value ?? 0),
                })))
            } else {
                console.error('Failed top products:', topProductsRes.reason)
                setTopProducts([])
            }

            if (statsRes.status === 'fulfilled') {
                setStats({
                    totalRevenue: Number(statsRes.value.totalRevenue || 0),
                    totalExpenses: Number(statsRes.value.totalExpenses || 0),
                    profit: Number(statsRes.value.profit || 0),
                    avgOrderValue: Number(statsRes.value.avgOrderValue || 0),
                })
            } else {
                console.error('Failed stats:', statsRes.reason)
                setStats({
                    totalRevenue: 0,
                    totalExpenses: 0,
                    profit: 0,
                    avgOrderValue: 0,
                })
            }

            if (
                monthlyRevenueRes.status === 'rejected' &&
                salesChartRes.status === 'rejected' &&
                topProductsRes.status === 'rejected' &&
                statsRes.status === 'rejected'
            ) {
                setError('Failed to load analytics data. Please try again.')
            }
        } catch (err) {
            console.error('Analytics error:', err)
            setError(err.message || 'Failed to load analytics data')
        } finally {
            setIsLoading(false)
        }
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="text-sm text-text-muted mt-1">
                        Deep insights into your business performance
                    </p>
                </div>

                <ErrorMessage message={error} onRetry={loadAnalyticsData} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="text-sm text-text-muted mt-1">
                        Deep insights into your business performance
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-surface-alt rounded-xl p-1 self-start sm:self-auto">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                period === p
                                    ? 'bg-white text-primary shadow-card'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Revenue',
                        value: formatCurrency(stats.totalRevenue),
                        icon: DollarSign,
                        bg: 'bg-primary',
                        change: '',
                        up: true,
                    },
                    {
                        label: 'Total Expenses',
                        value: formatCurrency(stats.totalExpenses),
                        icon: TrendingUp,
                        bg: 'bg-[#A78BFA]',
                        change: 'estimated',
                        up: false,
                    },
                    {
                        label: 'Net Profit',
                        value: formatCurrency(stats.profit),
                        icon: ShoppingCart,
                        bg: 'bg-secondary',
                        change: '',
                        up: true,
                    },
                    {
                        label: 'Avg Order Value',
                        value: formatCurrency(stats.avgOrderValue),
                        icon: Users,
                        bg: 'bg-[#2DD4BF]',
                        change: '',
                        up: true,
                    },
                ].map((kpi) => (
                    <div key={kpi.label} className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-text-muted">{kpi.label}</p>
                            <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon size={15} className="text-white" />
                            </div>
                        </div>

                        <p className="text-xl font-bold text-text-primary">{kpi.value}</p>

                        {kpi.change && (
                            <p className={`text-xs font-medium mt-1 ${kpi.up ? 'text-secondary' : 'text-red-500'}`}>
                                {kpi.change}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="card p-5">
                <div className="mb-5">
                    <h2 className="section-title">Revenue vs Expenses</h2>
                    <p className="text-sm text-text-muted mt-0.5">
                        Monthly comparison for {period.toLowerCase()}
                    </p>
                </div>

                {isLoading ? (
                    <div className="h-72 flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : revenueData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center">
                        <p className="text-sm text-text-muted">No revenue data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dy={8} />
                            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-8} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#38BDF8" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#38BDF8', strokeWidth: 0 }} />
                            <Area type="monotone" dataKey="expenses" stroke="#A78BFA" strokeWidth={2.5} fill="url(#expGrad)" dot={false} activeDot={{ r: 5, fill: '#A78BFA', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card p-5">
                    <div className="mb-5">
                        <h2 className="section-title">Sales Trend</h2>
                        <p className="text-sm text-text-muted mt-0.5">Daily sales performance</p>
                    </div>

                    {isLoading ? (
                        <div className="h-56 flex items-center justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : salesChartData.length === 0 ? (
                        <div className="h-56 flex items-center justify-center">
                            <p className="text-sm text-text-muted">No sales data available</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={salesChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-8} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                                <Bar dataKey="amount" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card p-5">
                    <div className="mb-5">
                        <h2 className="section-title">Top Products</h2>
                        <p className="text-sm text-text-muted mt-0.5">Revenue distribution by product</p>
                    </div>

                    {isLoading ? (
                        <div className="h-56 flex items-center justify-center">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : topProducts.length === 0 ? (
                        <div className="h-56 flex items-center justify-center">
                            <p className="text-sm text-text-muted">No product data available</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={topProducts}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {topProducts.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="flex-1 space-y-2">
                                {topProducts.map((product, i) => (
                                    <div key={product.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                            />
                                            <span className="text-xs text-text-secondary truncate">
                                                {product.name}
                                            </span>
                                        </div>

                                        <span className="text-xs font-semibold text-text-primary flex-shrink-0">
                                            {formatCurrency(product.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}