import { useState, useEffect } from 'react'
import { AlertTriangle, Package, XCircle, RefreshCw, TrendingDown } from 'lucide-react'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { formatCurrency, formatDate } from '../utils/formatters'
import productService from '../services/productService'
import toast from 'react-hot-toast'

export default function StockAlertsPage() {
    const [alerts, setAlerts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [restockTarget, setRestockTarget] = useState(null)
    const [quantity, setQuantity] = useState('')
    const [isRestocking, setIsRestocking] = useState(false)

    useEffect(() => {
        loadStockAlerts()
    }, [])

    const loadStockAlerts = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Try to get stock alerts from the dedicated endpoint first
            let data
            try {
                data = await productService.getStockAlerts()
            } catch (err) {
                // Fallback to low stock products if stock alerts endpoint doesn't exist
                console.log('Stock alerts endpoint not available, using low stock products')
                data = await productService.getLowStockProducts(10)
            }

            if (Array.isArray(data)) {
                setAlerts(data)
            } else if (data.data && Array.isArray(data.data)) {
                setAlerts(data.data)
            } else {
                setAlerts([])
            }
        } catch (err) {
            console.error('Failed to load stock alerts:', err)
            setError(err.message || 'Failed to load stock alerts.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRestock = async () => {
        const qty = parseInt(quantity, 10)
        if (!qty || qty <= 0) {
            toast.error('Enter a valid quantity')
            return
        }

        setIsRestocking(true)
        try {
            // Update stock via API
            await productService.updateStock(restockTarget.id, qty)
            
            // Update local state
            setAlerts((prev) =>
                prev.map((a) => a.id === restockTarget.id ? { ...a, stock: (a.stock || 0) + qty } : a)
                    .filter((a) => (a.stock || 0) <= 10) // Keep only items still low in stock
            )
            
            toast.success(`Restocked ${restockTarget.name} with ${qty} units`)
            setRestockTarget(null)
            setQuantity('')
        } catch (err) {
            console.error('Failed to restock:', err)
            toast.error(err.message || 'Failed to restock product')
        } finally {
            setIsRestocking(false)
        }
    }

    const outOfStock = alerts.filter((a) => (a.stock || 0) === 0)
    const lowStock = alerts.filter((a) => (a.stock || 0) > 0 && (a.stock || 0) <= 10)

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="page-title">Stock Alerts</h1>
                    <p className="text-sm text-text-muted mt-1">Products that need your attention</p>
                </div>
                <ErrorMessage message={error} onRetry={loadStockAlerts} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Stock Alerts</h1>
                <p className="text-sm text-text-muted mt-1">Products that need your attention</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Out of stock', value: outOfStock.length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Low stock', value: lowStock.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Total alerts', value: alerts.length, icon: TrendingDown, color: 'text-primary', bg: 'bg-primary-soft' },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="card p-16 flex justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {/* Out of stock */}
                    {outOfStock.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
                                <XCircle size={18} className="text-red-500" />
                                <h2 className="section-title text-red-600">Out of Stock ({outOfStock.length})</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {outOfStock.map((item) => (
                                    <AlertRow key={item.id} item={item} onRestock={() => { setRestockTarget(item); setQuantity('') }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Low stock */}
                    {lowStock.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
                                <AlertTriangle size={18} className="text-amber-500" />
                                <h2 className="section-title text-amber-600">Low Stock ({lowStock.length})</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {lowStock.map((item) => (
                                    <AlertRow key={item.id} item={item} onRestock={() => { setRestockTarget(item); setQuantity('') }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {alerts.length === 0 && (
                        <div className="card p-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-secondary-soft flex items-center justify-center mx-auto mb-4">
                                <Package size={24} className="text-secondary" />
                            </div>
                            <p className="font-semibold text-text-primary mb-1">All stocked up!</p>
                            <p className="text-sm text-text-muted">No stock alerts at the moment.</p>
                        </div>
                    )}
                </>
            )}

            {/* Restock modal */}
            <Modal
                isOpen={Boolean(restockTarget)}
                onClose={() => setRestockTarget(null)}
                title="Restock Product"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRestockTarget(null)} disabled={isRestocking}>Cancel</Button>
                        <Button onClick={handleRestock} isLoading={isRestocking} leftIcon={<RefreshCw size={14} />}>
                            Restock
                        </Button>
                    </>
                }
            >
                <div className="mb-4 p-3.5 rounded-xl bg-surface-alt">
                    <p className="font-medium text-text-primary">{restockTarget?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">SKU: {restockTarget?.sku} · Current stock: {restockTarget?.stock || 0}</p>
                </div>
                <Input
                    label="Quantity to add"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 50"
                    required
                />
            </Modal>
        </div>
    )
}

function AlertRow({ item, onRestock }) {
    return (
        <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.sku} · {item.category}</p>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0 mr-4">
                <p className="text-xs text-text-muted">Current / Reorder</p>
                <p className="text-sm font-semibold">
                    <span className={(item.stock || 0) === 0 ? 'text-red-500' : 'text-amber-500'}>{item.stock || 0}</span>
                    <span className="text-text-muted"> / {item.reorder_point || item.reorderPoint || 10}</span>
                </p>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0 mr-4">
                <p className="text-xs text-text-muted">Price</p>
                <p className="text-sm font-medium text-text-primary">{formatCurrency(item.price || 0)}</p>
            </div>
            <Badge variant={(item.stock || 0) === 0 ? 'error' : 'warning'}>
                {(item.stock || 0) === 0 ? 'Out of stock' : 'Low stock'}
            </Badge>
            <Button size="sm" variant="secondary" onClick={onRestock} leftIcon={<RefreshCw size={13} />}>
                Restock
            </Button>
        </div>
    )
}

// Made with Bob
