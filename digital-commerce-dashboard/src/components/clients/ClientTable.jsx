import { Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Table, Pagination } from '../common/Table'
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters'

const avatarColors = [
    'bg-primary-soft text-primary',
    'bg-secondary-soft text-green-700',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
]

export default function ClientTable({ clients, pagination, isLoading, onEdit, onDelete, onViewDebt, onPageChange }) {
    const columns = [
        {
            key: 'name',
            title: 'Client',
            render: (val, row, i) => (
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(val)}
                    </div>
                    <div>
                        <p className="font-medium text-text-primary">{val}</p>
                        <p className="text-xs text-text-muted">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone',
            title: 'Phone',
            render: (val) => <span className="text-text-secondary">{val || '—'}</span>,
        },
        {
            key: 'total_purchases',
            title: 'Total Purchases',
            render: (val) => <span className="font-semibold text-text-primary">{formatCurrency(val || 0)}</span>,
        },
        {
            key: 'outstanding_debt',
            title: 'Outstanding Debt',
            render: (val, row) => (
                <div className="flex items-center gap-1.5">
                    {val > 0 && <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                    <span className={val > 0 ? 'font-semibold text-red-500' : 'text-text-muted'}>
            {formatCurrency(val || 0)}
          </span>
                </div>
            ),
        },
        {
            key: 'created_at',
            title: 'Client Since',
            render: (val) => <span className="text-text-muted">{formatDate(val)}</span>,
        },
        {
            key: 'id',
            title: '',
            tdClass: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    {(row.outstanding_debt || 0) > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDebt(row) }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="View debt details"
                        >
                            <AlertCircle size={15} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onEdit(row) }} className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft transition-colors">
                        <Edit2 size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(row) }} className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ]

    // inject row index for avatar color
    const columnsWithIndex = columns.map((col) =>
        col.key === 'name'
            ? { ...col, render: (val, row) => columns[0].render(val, row, clients.indexOf(row)) }
            : col
    )

    return (
        <div>
            <Table columns={columnsWithIndex} data={clients} isLoading={isLoading} emptyMessage="No clients found. Add your first client." />
            {pagination && pagination.total > 0 && <Pagination pagination={pagination} onPageChange={onPageChange} />}
        </div>
    )
}