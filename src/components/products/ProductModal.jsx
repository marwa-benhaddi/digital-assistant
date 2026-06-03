import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input, { Select, Textarea } from '../common/Input'
import { validateProduct } from '../../utils/validators'
import { PRODUCT_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const initialForm = {
    name: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
    description: '',
}

const categoryOptions = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))

export default function ProductModal({ isOpen, onClose, product, onSave }) {
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = Boolean(product)

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setForm({
    name: product.name || '',
    category: product.category || '',
    price: product.price || '',
    stock: product.currentStock ?? product.stock ?? '',
    sku: product.sku || '',
    description: product.description || '',
})
            } else {
                setForm(initialForm)
            }
            setErrors({})
        }
    }, [isOpen, product])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async () => {
    const validationErrors = validateProduct(form)
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
    }

    setIsLoading(true)
    try {
        const payload = {
            name: form.name,
            category: form.category,
            price: Number(form.price),
            currentStock: Number(form.stock),
            sku: form.sku,
            description: form.description,
        }

        await onSave(payload)
        onClose()
    } catch (err) {
        toast.error(err.message || 'Failed to save product')
    } finally {
        setIsLoading(false)
    }
}

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Product' : 'Add New Product'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>
                        {isEditing ? 'Save changes' : 'Create product'}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Product name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    error={errors.name}
                    required
                    containerClass="sm:col-span-2"
                />

                <Select
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    options={categoryOptions}
                    placeholder="Select category"
                    error={errors.category}
                    required
                />

                <Input
                    label="SKU"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. ELEC-001"
                />

                <Input
                    label="Price (USD)"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.price}
                    required
                />

                <Input
                    label="Stock quantity"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.stock}
                />

                <Textarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Product description (optional)"
                    rows={3}
                    containerClass="sm:col-span-2"
                />
            </div>
        </Modal>
    )
}