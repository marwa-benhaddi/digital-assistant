import { ChevronLeft, ChevronRight } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export function Table({ columns, data, isLoading, emptyMessage = 'No data found.', className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                <tr className="border-b border-border bg-surface-alt">
                    {columns.map((col) => (
                        <th key={col.key} className={`table-th ${col.className || ''}`} style={col.style}>
                            {col.title}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={columns.length} className="py-16 text-center">
                            <div className="flex justify-center">
                                <LoadingSpinner size="md" />
                            </div>
                        </td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="py-16 text-center text-text-muted text-sm">
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((row, i) => (
                        <tr
                            key={row.id || i}
                            className="border-b border-border last:border-0 hover:bg-surface-alt/60 transition-colors"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={`table-td ${col.tdClass || ''}`}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    )
}

export function Pagination({ pagination, onPageChange }) {
    const { page, totalPages, total, limit } = pagination
    const from = total === 0 ? 0 : (page - 1) * limit + 1
    const to = Math.min(page * limit, total)

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-text-muted">
                Showing <span className="font-medium text-text-secondary">{from}–{to}</span> of{' '}
                <span className="font-medium text-text-secondary">{total}</span> results
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pageNum = totalPages <= 7 ? i + 1 : i < 3 ? i + 1 : i === 3 ? '…' : totalPages - (6 - i)
                    if (pageNum === '…') {
                        return (
                            <span key="ellipsis" className="px-2 text-text-muted text-sm">
                …
              </span>
                        )
                    }
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                                page === pageNum
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                            }`}
                        >
                            {pageNum}
                        </button>
                    )
                })}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

export default Table