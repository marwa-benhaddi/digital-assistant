import { useState, useEffect, useCallback } from 'react'
import productService from '../services/productService'
import toast from 'react-hot-toast'

export function useProducts(initialParams = {}) {
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [params, setParams] = useState(initialParams)

    const fetchProducts = useCallback(async (fetchParams = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            const mergedParams = { ...params, ...fetchParams }
            const data = await productService.getProducts(mergedParams)
            setProducts(data.products || data.data || [])
            if (data.pagination) setPagination(data.pagination)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const createProduct = useCallback(async (productData) => {
        const data = await productService.createProduct(productData)
        toast.success('Product created successfully')
        fetchProducts()
        return data
    }, [fetchProducts])

    const updateProduct = useCallback(async (id, productData) => {
        const data = await productService.updateProduct(id, productData)
        toast.success('Product updated successfully')
        fetchProducts()
        return data
    }, [fetchProducts])

    const deleteProduct = useCallback(async (id) => {
        await productService.deleteProduct(id)
        toast.success('Product deleted')
        fetchProducts()
    }, [fetchProducts])

    const updateParams = useCallback((newParams) => {
        setParams((prev) => ({ ...prev, ...newParams }))
    }, [])

    return {
        products,
        pagination,
        isLoading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        updateParams,
    }
}

export default useProducts