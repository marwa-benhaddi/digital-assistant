import { Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { Table, Pagination } from '../common/Table'
import { StatusBadge } from '../common/Badge'
import Button from '../common/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'

function getStockStatus(stock) {
    if (stock === 0) return 'out_of_stock'
    if (stock <= 10) return 'low_stock'
    return 'in_stock'
}

export default function ProductTable({ products, pagination, isLoading, onEdit, onDelete, onPageChange }) {
    const columns = [
        {
            key: 'name',
            title: 'Product',
            render: (val, row) => (
                <div>
                    <p className="font-medium text-text-primary">{val}</p>
                    {row.sku && <p className="text-xs text-text-muted mt-0.5">SKU: {row.sku}</p>}
                </div>
            ),
        },
        {
            key: 'category',
            title: 'Category',
            render: (val) => (
                <span className="text-sm text-text-secondary">{val || '—'}</span>
            ),
        },
        {
            key: 'price',
            title: 'Price',
            render: (val) => (
                <span className="font-semibold text-text-primary">{formatCurrency(val)}</span>
            ),
        },
        {
            key: 'stock',
            title: 'Stock',
            render: (val) => (
                <div className="flex items-center gap-2">
                    {val <= 10 && val > 0 && <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />}
                    <span className={`font-medium ${val === 0 ? 'text-red-500' : val <= 10 ? 'text-amber-600' : 'text-text-primary'}`}>
            {val ?? '—'}
          </span>
                </div>
            ),
        },
        {
            key: 'stock',
            title: 'Status',
            render: (val) => <StatusBadge status={getStockStatus(val)} />,
        },
        {
            key: 'created_at',
            title: 'Added',
            render: (val) => <span className="text-text-muted">{formatDate(val)}</span>,
        },
        {
            key: 'id',
            title: '',
            tdClass: 'text-right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(row) }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-soft transition-colors"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(row) }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <div>
            <Table
                columns={columns}
                data={products}
                isLoading={isLoading}
                emptyMessage="No products found. Add your first product."
            />
            {pagination && pagination.total > 0 && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    )
}