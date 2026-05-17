import { Package } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { StatusBadge } from '../common/Badge'
import { formatCurrency, formatDateTime, getInitials } from '../../utils/formatters'

export default function TransactionDetails({ isOpen, onClose, transaction }) {
    if (!transaction) return null

    const subtotal = transaction.total / 1.1
    const tax = transaction.total - subtotal

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Order #${transaction.id}`}
            size="lg"
            footer={
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            }
        >
            {/* Header info */}
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-border">
                <div>
                    <p className="text-xs text-text-muted mb-0.5">Order date</p>
                    <p className="text-sm font-medium text-text-primary">{formatDateTime(transaction.created_at)}</p>
                </div>
                <StatusBadge status={transaction.status} />
            </div>

            {/* Client */}
            <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-surface-alt">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {getInitials(transaction.client?.name || '?')}
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-primary">{transaction.client?.name || '—'}</p>
                    <p className="text-xs text-text-muted">{transaction.client?.email || '—'}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-text-muted">Payment method</p>
                    <p className="text-sm font-medium text-text-primary">{transaction.payment_method || '—'}</p>
                </div>
            </div>

            {/* Items */}
            <div className="mb-5">
                <p className="text-sm font-semibold text-text-primary mb-3">
                    Items ({transaction.items_count || transaction.items?.length || 0})
                </p>
                <div className="space-y-2">
                    {(transaction.items || [
                        { name: 'Sample Product A', qty: 2, price: 149.99 },
                        { name: 'Sample Product B', qty: 1, price: 89.00 },
                    ]).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt">
                            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center flex-shrink-0">
                                <Package size={14} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                                <p className="text-xs text-text-muted">Qty: {item.qty}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-text-primary">{formatCurrency(item.price * item.qty)}</p>
                                <p className="text-xs text-text-muted">{formatCurrency(item.price)} each</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-surface-alt p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-primary">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Tax (10%)</span>
                    <span className="text-text-primary">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                    <span className="text-text-primary">Total</span>
                    <span className="text-primary">{formatCurrency(transaction.total)}</span>
                </div>
            </div>
        </Modal>
    )
}