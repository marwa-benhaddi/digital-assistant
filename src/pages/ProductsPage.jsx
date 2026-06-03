import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Package } from 'lucide-react'
import Button from '../components/common/Button'
import ProductTable from '../components/products/ProductTable'
import ProductModal from '../components/products/ProductModal'
import ProductFilters from '../components/products/ProductFilters'
import Modal from '../components/common/Modal'
import ErrorMessage from '../components/common/ErrorMessage'
import { useDebounce } from '../hooks/usesDebounce.js'
import { formatCurrency } from '../utils/formatters'
import productService from '../services/productService'
import toast from 'react-hot-toast'

const PAGE_LIMIT = 10

const defaultFilters = {
    search: '',
    category: '',
    stock: '',
    sort: 'created_at:desc',
}

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_LIMIT,
        total: 0,
        totalPages: 1,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState(defaultFilters)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const debouncedSearch = useDebounce(filters.search, 280)

    const normalizeProductsResponse = (response) => {
        if (Array.isArray(response)) return response

        if (response?.data && Array.isArray(response.data)) {
            return response.data
        }

        if (response?.content && Array.isArray(response.content)) {
            return response.content
        }

        return []
    }

    const loadProducts = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await productService.getProducts()
            const list = normalizeProductsResponse(response)

            setProducts(list)
            setPagination((prev) => ({
                ...prev,
                page: 1,
            }))
        } catch (err) {
            console.error('Failed to load products:', err)
            setError(err.message || 'Failed to load products.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const processedProducts = useMemo(() => {
        return products
            .filter((product) => {
                const search = debouncedSearch?.toLowerCase().trim() || ''

                const name = product.name?.toLowerCase() || ''
                const description = product.description?.toLowerCase() || ''
                const sku = product.sku?.toLowerCase() || ''

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    description.includes(search) ||
                    sku.includes(search)

                const matchesCategory =
                    !filters.category || product.category === filters.category

                const stock = Number(product.stock ?? product.currentStock ?? 0)
                const minStock = Number(product.minStock ?? product.criticalStockThreshold ?? 5)

                let matchesStock = true

                if (filters.stock === 'in_stock') {
                    matchesStock = stock > minStock
                }

                if (filters.stock === 'low_stock') {
                    matchesStock = stock > 0 && stock <= minStock
                }

                if (filters.stock === 'out_of_stock') {
                    matchesStock = stock === 0
                }

                return matchesSearch && matchesCategory && matchesStock
            })
            .sort((a, b) => {
                const [field, direction] = (filters.sort || 'created_at:desc').split(':')

                let aValue
                let bValue

                if (field === 'created_at' || field === 'createdAt') {
                    aValue = new Date(a.created_at || a.createdAt || 0).getTime()
                    bValue = new Date(b.created_at || b.createdAt || 0).getTime()
                } else if (field === 'stock') {
                    aValue = Number(a.stock ?? a.currentStock ?? 0)
                    bValue = Number(b.stock ?? b.currentStock ?? 0)
                } else if (field === 'price') {
                    aValue = Number(a.price || 0)
                    bValue = Number(b.price || 0)
                } else {
                    aValue = String(a[field] || '').toLowerCase()
                    bValue = String(b[field] || '').toLowerCase()
                }

                if (aValue < bValue) return direction === 'asc' ? -1 : 1
                if (aValue > bValue) return direction === 'asc' ? 1 : -1
                return 0
            })
    }, [products, debouncedSearch, filters.category, filters.stock, filters.sort])

    const paginatedProducts = useMemo(() => {
        const start = (pagination.page - 1) * PAGE_LIMIT
        return processedProducts.slice(start, start + PAGE_LIMIT)
    }, [processedProducts, pagination.page])

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: processedProducts.length,
            totalPages: Math.max(1, Math.ceil(processedProducts.length / PAGE_LIMIT)),
            page: Math.min(prev.page, Math.max(1, Math.ceil(processedProducts.length / PAGE_LIMIT))),
        }))
    }, [processedProducts.length])

    const stats = useMemo(() => {
        const totalValue = products.reduce((sum, product) => {
            const price = Number(product.price || 0)
            const stock = Number(product.stock ?? product.currentStock ?? 0)
            return sum + price * stock
        }, 0)

        const lowStockCount = products.filter((product) => {
            const stock = Number(product.stock ?? product.currentStock ?? 0)
            const minStock = Number(product.minStock ?? product.criticalStockThreshold ?? 5)
            return stock > 0 && stock <= minStock
        }).length

        const outOfStockCount = products.filter((product) => {
            const stock = Number(product.stock ?? product.currentStock ?? 0)
            return stock === 0
        }).length

        return {
            totalValue,
            lowStockCount,
            outOfStockCount,
            totalProducts: products.length,
        }
    }, [products])

    const handleFilterChange = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }))
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleResetFilters = () => {
        setFilters(defaultFilters)
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleSave = async (formData) => {
        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, formData)
                toast.success('Product updated successfully')
            } else {
                await productService.createProduct(formData)
                toast.success('Product created successfully')
            }

            setEditingProduct(null)
            setModalOpen(false)
            loadProducts()
        } catch (err) {
            console.error('Failed to save product:', err)
            toast.error(err.message || 'Failed to save product')
            throw err
        }
    }

    const handleDelete = async () => {
        try {
            await productService.deleteProduct(deleteTarget.id)
            toast.success('Product deleted successfully')
            setDeleteTarget(null)
            loadProducts()
        } catch (err) {
            console.error('Failed to delete product:', err)
            toast.error(err.message || 'Failed to delete product')
        }
    }

    const openCreate = () => {
        setEditingProduct(null)
        setModalOpen(true)
    }

    const openEdit = (product) => {
        setEditingProduct(product)
        setModalOpen(true)
    }

    const handlePageChange = (page) => {
        setPagination((prev) => ({
            ...prev,
            page,
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="text-sm text-text-muted mt-1">
                        {stats.totalProducts} products in your catalog
                    </p>
                </div>

                <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
                    Add product
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total inventory value',
                        value: formatCurrency(stats.totalValue),
                        color: 'text-primary',
                    },
                    {
                        label: 'Low stock items',
                        value: stats.lowStockCount,
                        color: 'text-amber-500',
                    },
                    {
                        label: 'Out of stock',
                        value: stats.outOfStockCount,
                        color: 'text-red-500',
                    },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-text-muted mb-0.5">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>

                        <Package size={22} className={s.color + ' opacity-30'} />
                    </div>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border">
                    <ProductFilters
                        filters={filters}
                        onChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>

                {error ? (
                    <ErrorMessage message={error} onRetry={loadProducts} />
                ) : (
                    <ProductTable
                        products={paginatedProducts}
                        pagination={pagination}
                        isLoading={isLoading}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <ProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={editingProduct}
                onSave={handleSave}
            />

            <Modal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete Product"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>

                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-text-secondary">
                    Are you sure you want to delete{' '}
                    <strong className="text-text-primary">{deleteTarget?.name}</strong>? This
                    action cannot be undone.
                </p>
            </Modal>
        </div>
    )
}