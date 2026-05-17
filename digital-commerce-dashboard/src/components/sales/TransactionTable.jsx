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

export default function TransactionTable({ transactions, pagination, isLoading, onView, onCancel, onPageChange }) {
    const columns = [
        {
            key: 'id',
            title: 'Order ID',
            render: (val) => (
                <span className="font-mono text-sm font-semibold text-primary">#{val}</span>
            ),
        },
        {
            key: 'client',
            title: 'Client',
            render: (val, row, i) => (
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(val?.name || '?')}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{val?.name || '—'}</span>
                </div>
            ),
        },
        {
            key: 'items_count',
            title: 'Items',
            render: (val) => (
                <span className="text-text-secondary">{val ?? '—'} item{val !== 1 ? 's' : ''}</span>
            ),
        },
        {
            key: 'payment_method',
            title: 'Payment',
            render: (val) => <span className="text-text-secondary">{val || '—'}</span>,
        },
        {
            key: 'total',
            title: 'Total',
            render: (val) => (
                <span className="font-bold text-text-primary">{formatCurrency(val)}</span>
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
            render: (val) => <span className="text-text-muted text-xs">{formatDateTime(val)}</span>,
        },
        {
            key: 'id',
            title: '',
            tdClass: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(row) }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft transition-colors"
                        title="View details"
                    >
                        <Eye size={15} />
                    </button>
                    {row.status === 'pending' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onCancel(row) }}
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
        col.key === 'client'
            ? { ...col, render: (val, row) => columns[1].render(val, row, transactions.indexOf(row)) }
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