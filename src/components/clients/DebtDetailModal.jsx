import { useState } from 'react'
import { DollarSign, AlertCircle } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { formatCurrency, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const mockDebts = [
    { id: 1, description: 'Order #4390 — Unpaid balance', amount: 450.00, due_date: '2024-03-15', status: 'overdue' },
    { id: 2, description: 'Order #4410 — Partial payment pending', amount: 220.50, due_date: '2024-04-01', status: 'pending' },
]

export default function DebtDetailsModal({ isOpen, onClose, client, debts: propDebts }) {
    const [paying, setPaying] = useState(null)
    const [amount, setAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const debts = propDebts || mockDebts
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)

    const handlePayment = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error('Enter a valid payment amount')
            return
        }
        setIsLoading(true)
        try {
            await new Promise((r) => setTimeout(r, 600)) // simulate API
            toast.success(`Payment of ${formatCurrency(parseFloat(amount))} recorded`)
            setPaying(null)
            setAmount('')
        } catch {
            toast.error('Failed to record payment')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Debt Details — ${client?.name || ''}`}
            size="lg"
            footer={<Button variant="ghost" onClick={onClose}>Close</Button>}
        >
            {/* Summary */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-medium text-red-700">Total outstanding debt</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
                </div>
            </div>

            {/* Debt list */}
            <div className="space-y-3">
                {debts.map((debt) => (
                    <div key={debt.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-text-primary">{debt.description}</p>
                            <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                    debt.status === 'overdue' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                                }`}
                            >
                {debt.status}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg font-bold text-text-primary">{formatCurrency(debt.amount)}</p>
                                <p className="text-xs text-text-muted">Due: {formatDate(debt.due_date)}</p>
                            </div>
                            {paying === debt.id ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Amount"
                                        className="w-28 py-1.5 text-sm"
                                        leftIcon={<DollarSign size={13} />}
                                    />
                                    <Button size="sm" onClick={handlePayment} isLoading={isLoading}>Record</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setPaying(null); setAmount('') }}>Cancel</Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="secondary" onClick={() => { setPaying(debt.id); setAmount('') }}>
                                    Record payment
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    )
}