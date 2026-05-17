import { useState, useEffect } from 'react'
import { ShoppingCart, Users, Package, DollarSign, AlertCircle } from 'lucide-react'
import StatsCard from '../components/dashboard/StatsCard'
import SalesChart from '../components/dashboard/SalesChart'
import TopProductsChart from '../components/dashboard/TopProductsChart'
import RecentTransactions from '../components/dashboard/RecentTransaction.jsx'
import { formatCurrency } from '../utils/formatters'
import dashboardService from '../services/dashboardService'
import ErrorMessage from '../components/common/ErrorMessage'

export default function DashboardHome() {
    const [stats, setStats] = useState(null)
    const [salesChartData, setSalesChartData] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [recentTransactions, setRecentTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [chartPeriod, setChartPeriod] = useState(30)

    // Fetch all dashboard data
    useEffect(() => {
        fetchDashboardData()
    }, [])

    // Fetch sales chart data when period changes
    useEffect(() => {
        fetchSalesChart(chartPeriod)
    }, [chartPeriod])

    const fetchDashboardData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Fetch all data in parallel
            const [statsRes, salesRes, productsRes, transactionsRes] = await Promise.allSettled([
                dashboardService.getStats(),
                dashboardService.getSalesChart(30),
                dashboardService.getTopProducts(5),
                dashboardService.getRecentTransactions(6),
            ])

            // Handle stats
            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value)
            } else {
                console.error('Failed to fetch stats:', statsRes.reason)
                setStats(null)
            }

            // Handle sales chart
            if (salesRes.status === 'fulfilled') {
                const data = salesRes.value
                setSalesChartData(Array.isArray(data) ? transformSalesChartData(data) : [])
            } else {
                console.error('Failed to fetch sales chart:', salesRes.reason)
                setSalesChartData([])
            }

            // Handle top products
            if (productsRes.status === 'fulfilled') {
                const data = productsRes.value
                setTopProducts(Array.isArray(data) ? transformTopProductsData(data) : [])
            } else {
                console.error('Failed to fetch top products:', productsRes.reason)
                setTopProducts([])
            }

            // Handle recent transactions
            if (transactionsRes.status === 'fulfilled') {
                const data = transactionsRes.value
                setRecentTransactions(Array.isArray(data) ? data : [])
            } else {
                console.error('Failed to fetch transactions:', transactionsRes.reason)
                setRecentTransactions([])
            }

            // If all failed, show error
            if (
                statsRes.status === 'rejected' &&
                salesRes.status === 'rejected' &&
                productsRes.status === 'rejected' &&
                transactionsRes.status === 'rejected'
            ) {
                setError('Failed to load dashboard data. Please try again.')
            }
        } catch (err) {
            console.error('Dashboard error:', err)
            setError(err.message || 'Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSalesChart = async (days) => {
        try {
            const data = await dashboardService.getSalesChart(days)
            setSalesChartData(Array.isArray(data) ? transformSalesChartData(data) : [])
        } catch (err) {
            console.error('Failed to fetch sales chart:', err)
            setSalesChartData([])
        }
    }

    // Transform API data to chart format
    const transformSalesChartData = (data) => {
        return data.map((item) => ({
            label: item.label,
            revenue: item.amount || 0,
            orders: item.count || 0,
        }))
    }

    // Transform API data to top products format
    const transformTopProductsData = (data) => {
        return data.map((item) => ({
            name: item.productName,
            revenue: item.totalRevenue || 0,
            sales: item.totalSales || 0,
        }))
    }

    const handlePeriodChange = (period) => {
        // Map period labels to days
        const periodMap = {
            '7days': 7,
            '30days': 30,
            '90days': 90,
            '1year': 365,
        }
        const days = periodMap[period] || 30
        setChartPeriod(days)
    }

    const statCards = [
        {
            title: 'Monthly Revenue',
            value: stats ? formatCurrency(stats.monthSales || 0) : '—',
            change: null,
            icon: DollarSign,
            iconBg: 'bg-primary',
        },
        {
            title: 'Total Clients',
            value: stats ? stats.totalClients?.toLocaleString() || '0' : '—',
            change: null,
            icon: Users,
            iconBg: 'bg-secondary',
        },
        {
            title: 'Total Products',
            value: stats ? stats.totalProducts?.toLocaleString() || '0' : '—',
            change: null,
            icon: Package,
            iconBg: 'bg-[#2DD4BF]',
        },
        {
            title: 'Low Stock Items',
            value: stats ? stats.lowStockCount?.toLocaleString() || '0' : '—',
            change: null,
            icon: AlertCircle,
            iconBg: 'bg-[#F59E0B]',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="text-sm text-text-muted mt-1">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {/* Error message */}
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={fetchDashboardData}
                />
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((card) => (
                    <StatsCard key={card.title} {...card} isLoading={isLoading} />
                ))}
            </div>

            {/* Additional stats row */}
            {stats && !isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="card p-4">
                        <p className="text-sm text-text-muted mb-1">Today's Sales</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {formatCurrency(stats.todaySales || 0)}
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-text-muted mb-1">Week Sales</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {formatCurrency(stats.weekSales || 0)}
                        </p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-text-muted mb-1">Outstanding Debt</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(stats.outstandingDebt || 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2">
                    <SalesChart
                        data={salesChartData}
                        isLoading={isLoading}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>
                <TopProductsChart data={topProducts} isLoading={isLoading} />
            </div>

            {/* Recent transactions */}
            <RecentTransactions data={recentTransactions} isLoading={isLoading} />
        </div>
    )
}