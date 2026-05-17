import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, TrendingUp, DollarSign, Clock } from 'lucide-react'
import TransactionTable from '../components/sales/TransactionTable'
import TransactionFilters from '../components/sales/TransactionFilters'
import TransactionDetails from '../components/sales/TransactionDetails'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import ErrorMessage from '../components/common/ErrorMessage'
import { useDebounce } from '../hooks/usesDebounce.js'
import { formatCurrency } from '../utils/formatters'
import transactionService from '../services/transactionService'
import toast from 'react-hot-toast'

const PAGE_LIMIT = 10

const defaultFilters = { status: '', dateFrom: '', dateTo: '', sort: 'created_at:desc' }

export default function SalesPage() {
    const [transactions, setTransactions] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState(defaultFilters)
    const [search, setSearch] = useState('')
    const [viewingTx, setViewingTx] = useState(null)
    const [cancelTarget, setCancelTarget] = useState(null)
    const [stats, setStats] = useState({ revenue: 0, completedCount: 0, pendingCount: 0, totalCount: 0 })

    const debouncedSearch = useDebounce(search, 280)

    const loadTransactions = useCallback(async (page = 1) => {
        setIsLoading(true)
        setError(null)

        try {
            const params = {
                page,
                limit: PAGE_LIMIT,
                sort: filters.sort || 'created_at:desc',
            }

            if (debouncedSearch) params.search = debouncedSearch
            if (filters.status) params.status = filters.status
            if (filters.dateFrom) params.start = filters.dateFrom
            if (filters.dateTo) params.end = filters.dateTo

            const response = await transactionService.getTransactions(params)

            // Handle different response formats
            if (response.data && Array.isArray(response.data)) {
                setTransactions(response.data)
                setPagination({
                    page: response.page || page,
                    limit: response.limit || PAGE_LIMIT,
                    total: response.total || response.data.length,
                    totalPages: response.totalPages || Math.ceil((response.total || response.data.length) / PAGE_LIMIT),
                })
                calculateStats(response.data)
            } else if (Array.isArray(response)) {
                setTransactions(response)
                setPagination({
                    page,
                    limit: PAGE_LIMIT,
                    total: response.length,
                    totalPages: Math.ceil(response.length / PAGE_LIMIT),
                })
                calculateStats(response)
            }
        } catch (err) {
            console.error('Failed to load transactions:', err)
            setError(err.message || 'Failed to load transactions.')
        } finally {
            setIsLoading(false)
        }
    }, [filters.status, filters.dateFrom, filters.dateTo, filters.sort, debouncedSearch])

    const calculateStats = (allTransactions) => {
        if (!Array.isArray(allTransactions)) return

        const completed = allTransactions.filter((t) => t.status === 'completed' || t.status === 'COMPLETED')
        const revenue = completed.reduce((sum, t) => sum + (t.total || t.amount || 0), 0)
        const pending = allTransactions.filter((t) => t.status === 'pending' || t.status === 'PENDING').length

        setStats({
            revenue,
            completedCount: completed.length,
            pendingCount: pending,
            totalCount: allTransactions.length,
        })
    }

    useEffect(() => {
        loadTransactions(1)
    }, [loadTransactions])

    const handleFilterChange = (patch) => {
        if ('search' in patch) {
            setSearch(patch.search)
        } else {
            setFilters((prev) => ({ ...prev, ...patch }))
        }
    }

    const handleReset = () => {
        setFilters(defaultFilters)
        setSearch('')
    }

    const handleCancel = async () => {
        try {
            await transactionService.cancelTransaction(cancelTarget.id, 'Cancelled by user')
            toast.success(`Order #${cancelTarget.id} cancelled successfully`)
            setCancelTarget(null)
            loadTransactions(pagination.page)
        } catch (err) {
            console.error('Failed to cancel transaction:', err)
            toast.error(err.message || 'Failed to cancel transaction')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Sales</h1>
                    <p className="text-sm text-text-muted mt-1">{stats.totalCount} total transactions</p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-primary', iconBg: 'bg-primary-soft' },
                    { label: 'Completed orders', value: stats.completedCount, icon: TrendingUp, color: 'text-secondary', iconBg: 'bg-secondary-soft' },
                    { label: 'Pending orders', value: stats.pendingCount, icon: Clock, color: 'text-amber-500', iconBg: 'bg-amber-50' },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border">
                    <TransactionFilters
                        filters={{ ...filters, search }}
                        onChange={handleFilterChange}
                        onReset={handleReset}
                    />
                </div>
                {error ? (
                    <ErrorMessage message={error} onRetry={() => loadTransactions(pagination.page)} />
                ) : (
                    <TransactionTable
                        transactions={transactions}
                        pagination={pagination}
                        isLoading={isLoading}
                        onView={setViewingTx}
                        onCancel={setCancelTarget}
                        onPageChange={loadTransactions}
                    />
                )}
            </div>

            <TransactionDetails isOpen={Boolean(viewingTx)} onClose={() => setViewingTx(null)} transaction={viewingTx} />

            <Modal
                isOpen={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                title="Cancel Order"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setCancelTarget(null)}>Go back</Button>
                        <Button variant="danger" onClick={handleCancel}>Cancel order</Button>
                    </>
                }
            >
                <p className="text-sm text-text-secondary">
                    Cancel order <strong className="text-text-primary">#{cancelTarget?.id}</strong>? This cannot be undone.
                </p>
            </Modal>
        </div>
    )
}

// Made with Bob
