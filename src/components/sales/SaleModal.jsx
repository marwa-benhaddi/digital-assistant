import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input, { Select } from '../common/Input'
import productService from '../../services/productService'
import clientService from '../../services/clientService'
import transactionService from '../../services/transactionService'
import toast from 'react-hot-toast'

const initialForm = {
    productId: '',
    clientId: '',
    quantity: '1',
    unitPrice: '',
    type: 'cash',
    sendWhatsAppConfirmation: false,
}

export default function SaleModal({ isOpen, onClose, onCreated }) {
    const [form, setForm] = useState(initialForm)
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const loadData = async () => {
            setIsLoading(true)
            setErrors({})
            setForm(initialForm)

            try {
                const [productsData, clientsData] = await Promise.all([
                    productService.getProducts(),
                    clientService.getClients(),
                ])

                const productList = Array.isArray(productsData)
                    ? productsData
                    : productsData?.data || productsData?.content || []

                const clientList = Array.isArray(clientsData)
                    ? clientsData
                    : clientsData?.data || clientsData?.content || []

                setProducts(productList)
                setClients(clientList)
            } catch (error) {
                console.error('Failed to load sale data:', error)
                toast.error('Failed to load products or clients')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [isOpen])

    const selectedProduct = products.find((p) => String(p.id) === String(form.productId))

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const handleProductChange = (e) => {
        const productId = e.target.value
        const product = products.find((p) => String(p.id) === String(productId))

        setForm((prev) => ({
            ...prev,
            productId,
            unitPrice: product?.price ? String(product.price) : '',
        }))

        if (errors.productId) {
            setErrors((prev) => ({
                ...prev,
                productId: '',
            }))
        }
    }

    const validate = () => {
        const nextErrors = {}

        if (!form.productId) {
            nextErrors.productId = 'Product is required'
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
            nextErrors.quantity = 'Quantity must be positive'
        }

        if (selectedProduct) {
            const stock = Number(selectedProduct.stock ?? selectedProduct.currentStock ?? 0)

            if (Number(form.quantity) > stock) {
                nextErrors.quantity = `Only ${stock} items available`
            }
        }

        if (form.unitPrice && Number(form.unitPrice) <= 0) {
            nextErrors.unitPrice = 'Unit price must be positive'
        }

        if (!form.type) {
            nextErrors.type = 'Transaction type is required'
        }

        if (form.type === 'credit' && !form.clientId) {
            nextErrors.clientId = 'Client is required for credit sales'
        }

        return nextErrors
    }

    const handleSubmit = async () => {
        const validationErrors = validate()

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsSaving(true)

        try {
            const payload = {
                productId: Number(form.productId),
                clientId: form.clientId ? Number(form.clientId) : null,
                quantity: Number(form.quantity),
                unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
                type: form.type,
                sendWhatsAppConfirmation: Boolean(form.sendWhatsAppConfirmation),
            }

            await transactionService.createSale(payload)

            toast.success('Sale created successfully')
            onCreated?.()
            onClose()
        } catch (error) {
            console.error('Failed to create sale:', error)
            toast.error(error?.response?.data?.message || 'Failed to create sale')
        } finally {
            setIsSaving(false)
        }
    }

    const productOptions = [
        {
            value: '',
            label: isLoading ? 'Loading products...' : 'Select product',
        },
        ...products.map((product) => ({
            value: product.id,
            label: `${product.name} — Stock: ${product.stock ?? product.currentStock ?? 0}`,
        })),
    ]

    const clientOptions = [
        {
            value: '',
            label: form.type === 'credit' ? 'Select client' : 'No client',
        },
        ...clients.map((client) => ({
            value: client.id,
            label: `${client.name || client.fullName || 'Client'}${client.phone ? ` — ${client.phone}` : ''}`,
        })),
    ]

    const total = Number(form.quantity || 0) * Number(form.unitPrice || selectedProduct?.price || 0)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Sale"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit} isLoading={isSaving}>
                        Create sale
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Product"
                    name="productId"
                    value={form.productId}
                    onChange={handleProductChange}
                    options={productOptions}
                    error={errors.productId}
                    required
                    containerClass="sm:col-span-2"
                />

                <Select
                    label="Client"
                    name="clientId"
                    value={form.clientId}
                    onChange={handleChange}
                    options={clientOptions}
                    error={errors.clientId}
                />

                <Select
                    label="Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'credit', label: 'Credit' },
                    ]}
                    error={errors.type}
                    required
                />

                <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    required
                />

                <Input
                    label="Unit price"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={handleChange}
                    error={errors.unitPrice}
                    placeholder={selectedProduct?.price ? String(selectedProduct.price) : 'Auto'}
                />

                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-text-secondary">
                    <input
                        type="checkbox"
                        name="sendWhatsAppConfirmation"
                        checked={form.sendWhatsAppConfirmation}
                        onChange={handleChange}
                        disabled={!form.clientId}
                    />
                    Send WhatsApp confirmation
                </label>

                <div className="sm:col-span-2 p-4 rounded-xl bg-surface-alt border border-border">
                    <p className="text-sm text-text-muted">Total</p>
                    <p className="text-xl font-bold text-text-primary">
                        {total.toFixed(2)}
                    </p>
                </div>
            </div>
        </Modal>
    )
}