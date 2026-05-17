import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '../common/Badge'
import { formatCurrency, formatRelativeTime, getInitials } from '../../utils/formatters'
import { ROUTES } from '../../utils/constants'
import LoadingSpinner from '../common/LoadingSpinner'

const avatarColors = ['bg-primary-soft text-primary', 'bg-secondary-soft text-green-700', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600']

export default function RecentTransactions({ data, isLoading }) {
    const navigate = useNavigate()

    return (
        <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                    <h2 className="section-title">Recent Transactions</h2>
                    <p className="text-sm text-text-muted mt-0.5">Latest sales activity</p>
                </div>
                <button
                    onClick={() => navigate(ROUTES.SALES)}
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    View all <ArrowRight size={15} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" />
                </div>
            ) : !data || data.length === 0 ? (
                <p className="py-12 text-center text-sm text-text-muted">No transactions yet.</p>
            ) : (
                <div className="divide-y divide-border">
                    {data.map((tx, i) => (
                        <div
                            key={tx.id}
                            onClick={() => navigate(ROUTES.SALES)}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-alt/60 cursor-pointer transition-colors"
                        >
                            {/* Avatar */}
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                                    avatarColors[i % avatarColors.length]
                                }`}
                            >
                                {getInitials(tx.client?.name || '?')}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{tx.client?.name}</p>
                                <p className="text-xs text-text-muted mt-0.5">
                                    #{tx.id} · {formatRelativeTime(tx.created_at)}
                                </p>
                            </div>

                            {/* Amount & Status */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-text-primary">{formatCurrency(tx.total)}</p>
                                <div className="mt-1">
                                    <StatusBadge status={tx.status} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}