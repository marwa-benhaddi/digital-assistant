import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, TrendingUp, DollarSign, Clock } from 'lucide-react'
import TransactionTable from '../components/sales/TransactionTable'
import TransactionFilters from '../components/sales/TransactionFilters'
import TransactionDetails from '../components/sales/TransactionDetails'
import SaleModal from '../components/sales/SaleModal'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import ErrorMessage from '../components/common/ErrorMessage'
import { useDebounce } from '../hooks/usesDebounce.js'
import { formatCurrency } from '../utils/formatters'
import transactionService from '../services/transactionService'
import toast from 'react-hot-toast'

const PAGE_LIMIT = 10

const defaultFilters = {
    status: '',
    dateFrom: '',
    dateTo: '',
    sort: 'created_at:desc',
}

export default function SalesPage() {
    const [transactions, setTransactions] = useState([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_LIMIT,
        total: 0,
        totalPages: 1,
    })

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const [filters, setFilters] = useState(defaultFilters)
    const [search, setSearch] = useState('')

    const [saleModalOpen, setSaleModalOpen] = useState(false)
    const [viewingTx, setViewingTx] = useState(null)
    const [cancelTarget, setCancelTarget] = useState(null)

    const debouncedSearch = useDebounce(search, 280)

    const normalizeTransactionsResponse = (response) => {
        if (Array.isArray(response)) return response

        if (response?.data && Array.isArray(response.data)) {
            return response.data
        }

        if (response?.content && Array.isArray(response.content)) {
            return response.content
        }

        return []
    }

    const loadTransactions = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await transactionService.getTransactions()
            const list = normalizeTransactionsResponse(response)

            setTransactions(list)
            setPagination((prev) => ({
                ...prev,
                page: 1,
            }))
        } catch (err) {
            console.error('Failed to load transactions:', err)
            setError(err.message || 'Failed to load transactions.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTransactions()
    }, [loadTransactions])

    const processedTransactions = useMemo(() => {
        return transactions
            .filter((tx) => {
                const query = debouncedSearch.toLowerCase().trim()

                const clientName = tx.clientName?.toLowerCase() || ''
                const productName = tx.productName?.toLowerCase() || ''
                const id = String(tx.id || '')

                const matchesSearch =
                    !query ||
                    clientName.includes(query) ||
                    productName.includes(query) ||
                    id.includes(query)

                const txStatus = String(tx.status || '').toLowerCase()
                const selectedStatus = String(filters.status || '').toLowerCase()

                const matchesStatus =
                    !selectedStatus ||
                    txStatus === selectedStatus ||
                    (selectedStatus === 'completed' && txStatus === 'paid') ||
                    (selectedStatus === 'pending' && txStatus === 'pending') ||
                    (selectedStatus === 'cancelled' && txStatus === 'cancelled') ||
                    (selectedStatus === 'refunded' && txStatus === 'refunded')

                const txDateRaw =
                    tx.created_at ||
                    tx.createdAt ||
                    tx.transactionDate ||
                    tx.date

                const txDate = txDateRaw ? new Date(txDateRaw) : null

                let matchesDate = true

                if (filters.dateFrom && txDate) {
                    matchesDate = matchesDate && txDate >= new Date(filters.dateFrom)
                }

                if (filters.dateTo && txDate) {
                    const endDate = new Date(filters.dateTo)
                    endDate.setHours(23, 59, 59, 999)
                    matchesDate = matchesDate && txDate <= endDate
                }

                return matchesSearch && matchesStatus && matchesDate
            })
            .sort((a, b) => {
                const [field, direction] = (filters.sort || 'created_at:desc').split(':')

                let aValue
                let bValue

                if (field === 'created_at' || field === 'createdAt') {
                    aValue = new Date(a.created_at || a.createdAt || a.transactionDate || 0).getTime()
                    bValue = new Date(b.created_at || b.createdAt || b.transactionDate || 0).getTime()
                } else if (field === 'total' || field === 'amount' || field === 'totalPrice') {
                    aValue = Number(a.total ?? a.amount ?? a.totalPrice ?? 0)
                    bValue = Number(b.total ?? b.amount ?? b.totalPrice ?? 0)
                } else {
                    aValue = String(a[field] || '').toLowerCase()
                    bValue = String(b[field] || '').toLowerCase()
                }

                if (aValue < bValue) return direction === 'asc' ? -1 : 1
                if (aValue > bValue) return direction === 'asc' ? 1 : -1
                return 0
            })
    }, [transactions, debouncedSearch, filters.status, filters.dateFrom, filters.dateTo, filters.sort])

    const paginatedTransactions = useMemo(() => {
        const start = (pagination.page - 1) * PAGE_LIMIT
        return processedTransactions.slice(start, start + PAGE_LIMIT)
    }, [processedTransactions, pagination.page])

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: processedTransactions.length,
            totalPages: Math.max(1, Math.ceil(processedTransactions.length / PAGE_LIMIT)),
            page: Math.min(prev.page, Math.max(1, Math.ceil(processedTransactions.length / PAGE_LIMIT))),
        }))
    }, [processedTransactions.length])

    const stats = useMemo(() => {
        const paidTransactions = transactions.filter((tx) => {
            const status = String(tx.status || '').toLowerCase()
            return status === 'paid' || status === 'completed'
        })

        const pendingTransactions = transactions.filter((tx) => {
            const status = String(tx.status || '').toLowerCase()
            return status === 'pending'
        })

        const revenue = paidTransactions.reduce((sum, tx) => {
            const amount = Number(tx.total ?? tx.amount ?? tx.totalPrice ?? 0)
            return sum + amount
        }, 0)

        return {
            revenue,
            completedCount: paidTransactions.length,
            pendingCount: pendingTransactions.length,
            totalCount: transactions.length,
        }
    }, [transactions])

    const handleFilterChange = (patch) => {
        if ('search' in patch) {
            setSearch(patch.search)
        } else {
            setFilters((prev) => ({
                ...prev,
                ...patch,
            }))
        }

        setPagination((prev) => ({
            ...prev,
            page: 1,
        }))
    }

    const handleReset = () => {
        setFilters(defaultFilters)
        setSearch('')
        setPagination((prev) => ({
            ...prev,
            page: 1,
        }))
    }

    const handleCancel = async () => {
        try {
            await transactionService.cancelTransaction(cancelTarget.id)
            toast.success(`Order #${cancelTarget.id} cancelled successfully`)
            setCancelTarget(null)
            loadTransactions()
        } catch (err) {
            console.error('Failed to cancel transaction:', err)
            toast.error(err?.response?.data?.message || err.message || 'Failed to cancel transaction')
        }
    }

    const handlePageChange = (page) => {
        setPagination((prev) => ({
            ...prev,
            page,
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Sales</h1>
                    <p className="text-sm text-text-muted mt-1">
                        {stats.totalCount} total transactions
                    </p>
                </div>

                <Button onClick={() => setSaleModalOpen(true)} leftIcon={<Plus size={16} />}>
                    New sale
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total revenue',
                        value: formatCurrency(stats.revenue),
                        icon: DollarSign,
                        color: 'text-primary',
                        iconBg: 'bg-primary-soft',
                    },
                    {
                        label: 'Completed orders',
                        value: stats.completedCount,
                        icon: TrendingUp,
                        color: 'text-secondary',
                        iconBg: 'bg-secondary-soft',
                    },
                    {
                        label: 'Pending orders',
                        value: stats.pendingCount,
                        icon: Clock,
                        color: 'text-amber-500',
                        iconBg: 'bg-amber-50',
                    },
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

            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border">
                    <TransactionFilters
                        filters={{ ...filters, search }}
                        onChange={handleFilterChange}
                        onReset={handleReset}
                    />
                </div>

                {error ? (
                    <ErrorMessage message={error} onRetry={loadTransactions} />
                ) : (
                    <TransactionTable
                        transactions={paginatedTransactions}
                        pagination={pagination}
                        isLoading={isLoading}
                        onView={setViewingTx}
                        onCancel={setCancelTarget}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <SaleModal
                isOpen={saleModalOpen}
                onClose={() => setSaleModalOpen(false)}
                onCreated={loadTransactions}
            />

            <TransactionDetails
                isOpen={Boolean(viewingTx)}
                onClose={() => setViewingTx(null)}
                transaction={viewingTx}
            />

            <Modal
                isOpen={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                title="Cancel Order"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setCancelTarget(null)}>
                            Go back
                        </Button>

                        <Button variant="danger" onClick={handleCancel}>
                            Cancel order
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-text-secondary">
                    Cancel order{' '}
                    <strong className="text-text-primary">#{cancelTarget?.id}</strong>? This
                    cannot be undone.
                </p>
            </Modal>
        </div>
    )
}