import { Package } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { StatusBadge } from '../common/Badge'
import { formatCurrency, formatDateTime, getInitials } from '../../utils/formatters'

export default function TransactionDetails({ isOpen, onClose, transaction }) {
    if (!transaction) return null

    const clientName =
        transaction.clientName ||
        transaction.customerName ||
        transaction.client?.name ||
        transaction.customer?.name ||
        '—'

    const clientEmail =
        transaction.clientEmail ||
        transaction.client?.email ||
        transaction.customer?.email ||
        ''

    const paymentMethod =
        transaction.paymentMethod ||
        transaction.payment_method ||
        transaction.type ||
        '—'

    const date =
        transaction.created_at ||
        transaction.createdAt ||
        transaction.transactionDate ||
        transaction.date

    const productName =
        transaction.productName ||
        transaction.product?.name ||
        'Product'

    const quantity = Number(
        transaction.quantity ??
        transaction.itemsCount ??
        transaction.items_count ??
        1
    )

    const unitPrice = Number(
        transaction.unitPrice ??
        transaction.unit_price ??
        transaction.items?.[0]?.price ??
        0
    )

    const total = Number(
        transaction.total ??
        transaction.totalPrice ??
        transaction.amount ??
        transaction.totalAmount ??
        unitPrice * quantity
    )

    const items = Array.isArray(transaction.items) && transaction.items.length > 0
        ? transaction.items.map((item) => ({
            name: item.name || item.productName || productName,
            quantity: Number(item.quantity ?? item.qty ?? quantity),
            price: Number(item.price ?? item.unitPrice ?? unitPrice),
        }))
        : [
            {
                name: productName,
                quantity,
                price: unitPrice,
            },
        ]

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
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-border">
                <div>
                    <p className="text-xs text-text-muted mb-0.5">Order date</p>
                    <p className="text-sm font-medium text-text-primary">
                        {formatDateTime(date)}
                    </p>
                </div>

                <StatusBadge status={transaction.status} />
            </div>

            <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-surface-alt">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {getInitials(clientName)}
                </div>

                <div>
                    <p className="text-sm font-semibold text-text-primary">
                        {clientName}
                    </p>
                    <p className="text-xs text-text-muted">
                        {clientEmail || '—'}
                    </p>
                </div>

                <div className="ml-auto text-right">
                    <p className="text-xs text-text-muted">Payment method</p>
                    <p className="text-sm font-medium text-text-primary capitalize">
                        {paymentMethod}
                    </p>
                </div>
            </div>

            <div className="mb-5">
                <p className="text-sm font-semibold text-text-primary mb-3">
                    Items ({items.length})
                </p>

                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt">
                            <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center flex-shrink-0">
                                <Package size={14} className="text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {item.name}
                                </p>
                                <p className="text-xs text-text-muted">
                                    Qty: {item.quantity}
                                </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-text-primary">
                                    {formatCurrency(item.price * item.quantity)}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {formatCurrency(item.price)} each
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl bg-surface-alt p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-primary">{formatCurrency(total)}</span>
                </div>

                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                    <span className="text-text-primary">Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                </div>
            </div>
        </Modal>
    )
}