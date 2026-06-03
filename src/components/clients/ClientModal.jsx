import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input, { Textarea } from '../common/Input'
import { validateClient } from '../../utils/validators'
import toast from 'react-hot-toast'

const initialForm = { name: '', email: '', phone: '', address: '', notes: '' }

export default function ClientModal({ isOpen, onClose, client, onSave }) {
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = Boolean(client)

    useEffect(() => {
        if (isOpen) {
            setForm(client ? { name: client.name || '', email: client.email || '', phone: client.phone || '', address: client.address || '', notes: client.notes || '' } : initialForm)
            setErrors({})
        }
    }, [isOpen, client])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async () => {
        const validationErrors = validateClient(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setIsLoading(true)
        try {
            await onSave(form)
            onClose()
        } catch (err) {
            toast.error(err.message || 'Failed to save client')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Client' : 'Add New Client'}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>
                        {isEditing ? 'Save changes' : 'Add client'}
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" error={errors.name} required containerClass="sm:col-span-2" />
                <Input label="Email address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" error={errors.email} required />
                <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" error={errors.phone} />
                <Textarea label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Country" rows={2} containerClass="sm:col-span-2" />
                <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes…" rows={2} containerClass="sm:col-span-2" />
            </div>
        </Modal>
    )
}