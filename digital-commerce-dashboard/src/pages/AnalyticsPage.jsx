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

const COLORS = Object.values(CHART_COLORS)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-border rounded-xl shadow-card-md px-4 py-3 text-sm">
            <p className="font-semibold text-text-primary mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-text-muted capitalize">{p.dataKey}:</span>
                    <span className="font-medium">{typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}</span>
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

    const loadAnalyticsData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const currentYear = new Date().getFullYear()
            
            // Fetch data in parallel
            const [monthlyRevenueRes, salesChartRes, topProductsRes, statsRes] = await Promise.allSettled([
                analyticsService.getMonthlyRevenue(currentYear),
                analyticsService.getSalesChart(period === 'This Month' ? 30 : period === 'Last 3 Months' ? 90 : 365),
                analyticsService.getTopProducts(5),
                analyticsService.getStats(),
            ])

            // Handle monthly revenue
            if (monthlyRevenueRes.status === 'fulfilled') {
                const data = monthlyRevenueRes.value
                if (Array.isArray(data)) {
                    setRevenueData(data.map(item => ({
                        month: item.month || item.label,
                        revenue: item.revenue || item.amount || 0,
                        expenses: item.expenses || 0,
                    })))
                }
            }

            // Handle sales chart
            if (salesChartRes.status === 'fulfilled') {
                const data = salesChartRes.value
                if (Array.isArray(data)) {
                    setSalesChartData(data)
                }
            }

            // Handle top products
            if (topProductsRes.status === 'fulfilled') {
                const data = topProductsRes.value
                if (Array.isArray(data)) {
                    setTopProducts(data.map(item => ({
                        name: item.productName || item.name,
                        value: item.totalRevenue || item.revenue || 0,
                    })))
                }
            }

            // Handle stats
            if (statsRes.status === 'fulfilled') {
                const data = statsRes.value
                const totalRevenue = data.monthSales || 0
                const totalExpenses = totalRevenue * 0.4 // Estimate expenses as 40% of revenue
                const profit = totalRevenue - totalExpenses
                const avgOrderValue = salesChartData.length > 0 
                    ? totalRevenue / salesChartData.reduce((sum, item) => sum + (item.count || 0), 0)
                    : 0

                setStats({
                    totalRevenue,
                    totalExpenses,
                    profit,
                    avgOrderValue,
                })
            }

            // If all failed, show error
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
                    <p className="text-sm text-text-muted mt-1">Deep insights into your business performance</p>
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
                    <p className="text-sm text-text-muted mt-1">Deep insights into your business performance</p>
                </div>
                <div className="flex items-center gap-1 bg-surface-alt rounded-xl p-1 self-start sm:self-auto">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                period === p ? 'bg-white text-primary shadow-card' : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, bg: 'bg-primary', change: '+14.2%', up: true },
                    { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), icon: TrendingUp, bg: 'bg-[#A78BFA]', change: '+6.8%', up: false },
                    { label: 'Net Profit', value: formatCurrency(stats.profit), icon: ShoppingCart, bg: 'bg-secondary', change: '+21.4%', up: true },
                    { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), icon: Users, bg: 'bg-[#2DD4BF]', change: '+5.1%', up: true },
                ].map((kpi) => (
                    <div key={kpi.label} className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-text-muted">{kpi.label}</p>
                            <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon size={15} className="text-white" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-text-primary">{kpi.value}</p>
                        <p className={`text-xs font-medium mt-1 ${kpi.up ? 'text-secondary' : 'text-red-500'}`}>{kpi.change} vs last period</p>
                    </div>
                ))}
            </div>

            {/* Revenue vs Expenses */}
            <div className="card p-5">
                <div className="mb-5">
                    <h2 className="section-title">Revenue vs Expenses</h2>
                    <p className="text-sm text-text-muted mt-0.5">Monthly comparison for {period.toLowerCase()}</p>
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
                            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-8} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#38BDF8" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#38BDF8', strokeWidth: 0 }} />
                            <Area type="monotone" dataKey="expenses" stroke="#A78BFA" strokeWidth={2.5} fill="url(#expGrad)" dot={false} activeDot={{ r: 5, fill: '#A78BFA', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Sales chart */}
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

                {/* Sales by category */}
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
                                    <Pie data={topProducts} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {topProducts.map((product, i) => (
                                    <div key={product.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-text-secondary truncate">{product.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-text-primary flex-shrink-0">{formatCurrency(product.value)}</span>
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

// Made with Bob
