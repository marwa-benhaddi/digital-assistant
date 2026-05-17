import { useState, useEffect, useCallback } from 'react'
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

const defaultFilters = { search: '', category: '', stock: '', sort: 'created_at:desc' }

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState(defaultFilters)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [stats, setStats] = useState({ totalValue: 0, lowStockCount: 0, outOfStockCount: 0, totalProducts: 0 })

    const debouncedSearch = useDebounce(filters.search, 280)

    const loadProducts = useCallback(async (page = 1) => {
        setIsLoading(true)
        setError(null)
        
        try {
            // Build query parameters
            const params = {
                page,
                limit: PAGE_LIMIT,
                sort: filters.sort || 'created_at:desc',
            }
            
            if (debouncedSearch) params.search = debouncedSearch
            if (filters.category) params.category = filters.category
            if (filters.stock) params.stock = filters.stock

            const response = await productService.getProducts(params)
            
            // Handle different response formats
            if (response.data && Array.isArray(response.data)) {
                setProducts(response.data)
                setPagination({
                    page: response.page || page,
                    limit: response.limit || PAGE_LIMIT,
                    total: response.total || response.data.length,
                    totalPages: response.totalPages || Math.ceil((response.total || response.data.length) / PAGE_LIMIT),
                })
            } else if (Array.isArray(response)) {
                // If response is just an array
                setProducts(response)
                setPagination({
                    page,
                    limit: PAGE_LIMIT,
                    total: response.length,
                    totalPages: Math.ceil(response.length / PAGE_LIMIT),
                })
            }

            // Calculate stats from all products
            calculateStats(response.data || response)
        } catch (err) {
            console.error('Failed to load products:', err)
            setError(err.message || 'Failed to load products.')
        } finally {
            setIsLoading(false)
        }
    }, [filters.category, filters.stock, filters.sort, debouncedSearch])

    const calculateStats = (allProducts) => {
        if (!Array.isArray(allProducts)) return
        
        const totalValue = allProducts.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0)
        const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= 10).length
        const outOfStockCount = allProducts.filter((p) => p.stock === 0).length
        
        setStats({
            totalValue,
            lowStockCount,
            outOfStockCount,
            totalProducts: allProducts.length,
        })
    }

    useEffect(() => {
        loadProducts(1)
    }, [loadProducts])

    const handleFilterChange = (patch) => setFilters((prev) => ({ ...prev, ...patch }))
    const handleResetFilters = () => setFilters(defaultFilters)

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
            loadProducts(1)
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
            loadProducts(pagination.page)
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

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total inventory value', value: formatCurrency(stats.totalValue), color: 'text-primary' },
                    { label: 'Low stock items', value: stats.lowStockCount, color: 'text-amber-500' },
                    { label: 'Out of stock', value: stats.outOfStockCount, color: 'text-red-500' },
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

            {/* Filters + Table */}
            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border">
                    <ProductFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
                </div>

                {error ? (
                    <ErrorMessage message={error} onRetry={() => loadProducts(pagination.page)} />
                ) : (
                    <ProductTable
                        products={products}
                        pagination={pagination}
                        isLoading={isLoading}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onPageChange={loadProducts}
                    />
                )}
            </div>

            {/* Create / Edit modal */}
            <ProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={editingProduct}
                onSave={handleSave}
            />

            {/* Delete confirm */}
            <Modal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete Product"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                <p className="text-sm text-text-secondary">
                    Are you sure you want to delete <strong className="text-text-primary">{deleteTarget?.name}</strong>? This action cannot be undone.
                </p>
            </Modal>
        </div>
    )
}

// Made with Bob
