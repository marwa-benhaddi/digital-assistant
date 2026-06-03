import { Eye, XCircle } from 'lucide-react'
import { Table, Pagination } from '../common/Table'
import { StatusBadge } from '../common/Badge'
import { formatCurrency, formatDateTime, getInitials } from '../../utils/formatters'

const avatarColors = [
    'bg-primary-soft text-primary',
    'bg-secondary-soft text-green-700',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
]

export default function TransactionTable({
    transactions,
    pagination,
    isLoading,
    onView,
    onCancel,
    onPageChange,
}) {
    const getClientName = (row) => {
        return (
            row.clientName ||
            row.customerName ||
            row.client?.name ||
            row.customer?.name ||
            '—'
        )
    }

    const getItemsLabel = (row) => {
        const productName = row.productName || row.product?.name
        const quantity = row.quantity ?? row.itemsCount ?? row.items_count

        if (productName) {
            return `${quantity || 1} × ${productName}`
        }

        if (Array.isArray(row.items) && row.items.length > 0) {
            if (row.items.length === 1) {
                const item = row.items[0]
                return `${item.quantity || 1} × ${item.name || item.productName || 'Item'}`
            }

            return `${row.items.length} items`
        }

        return '—'
    }

    const getPaymentMethod = (row) => {
        return row.paymentMethod || row.payment_method || row.type || '—'
    }

    const getTotal = (row) => {
        return Number(row.total ?? row.totalPrice ?? row.amount ?? row.totalAmount ?? 0)
    }

    const getDate = (row) => {
        return row.created_at || row.createdAt || row.transactionDate || row.date
    }

    const columns = [
        {
            key: 'id',
            title: 'Order ID',
            render: (val) => (
                <span className="font-mono text-sm font-semibold text-primary">#{val}</span>
            ),
        },
        {
            key: 'clientName',
            title: 'Client',
            render: (_, row, i) => {
                const clientName = getClientName(row)

                return (
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                            {getInitials(clientName)}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                            {clientName}
                        </span>
                    </div>
                )
            },
        },
        {
            key: 'items',
            title: 'Items',
            render: (_, row) => (
                <span className="text-text-secondary">{getItemsLabel(row)}</span>
            ),
        },
        {
            key: 'paymentMethod',
            title: 'Payment',
            render: (_, row) => (
                <span className="text-text-secondary capitalize">{getPaymentMethod(row)}</span>
            ),
        },
        {
            key: 'total',
            title: 'Total',
            render: (_, row) => (
                <span className="font-bold text-text-primary">
                    {formatCurrency(getTotal(row))}
                </span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'created_at',
            title: 'Date',
            render: (_, row) => (
                <span className="text-text-muted text-xs">
                    {formatDateTime(getDate(row))}
                </span>
            ),
        },
        {
            key: 'actions',
            title: '',
            tdClass: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onView(row)
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft transition-colors"
                        title="View details"
                    >
                        <Eye size={15} />
                    </button>

                    {String(row.status || '').toLowerCase() === 'pending' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCancel(row)
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel order"
                        >
                            <XCircle size={15} />
                        </button>
                    )}
                </div>
            ),
        },
    ]

    const columnsWithIndex = columns.map((col) =>
        col.key === 'clientName'
            ? {
                  ...col,
                  render: (val, row) => col.render(val, row, transactions.indexOf(row)),
              }
            : col
    )

    return (
        <div>
            <Table
                columns={columnsWithIndex}
                data={transactions}
                isLoading={isLoading}
                emptyMessage="No transactions found."
            />

            {pagination && pagination.total > 0 && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    )
}