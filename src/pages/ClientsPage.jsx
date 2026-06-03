import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Search, X, Users } from 'lucide-react'
import Button from '../components/common/Button'
import ClientTable from '../components/clients/ClientTable'
import ClientModal from '../components/clients/ClientModal'
import DebtDetailsModal from '../components/clients/DebtDetailModal.jsx'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import ErrorMessage from '../components/common/ErrorMessage'
import { useDebounce } from '../hooks/usesDebounce.js'
import { formatCurrency } from '../utils/formatters'
import clientService from '../services/clientService'
import toast from 'react-hot-toast'

const PAGE_LIMIT = 10

export default function ClientsPage() {
    const [clients, setClients] = useState([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_LIMIT,
        total: 0,
        totalPages: 1,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [debtClient, setDebtClient] = useState(null)

    const debouncedSearch = useDebounce(search, 280)

    const normalizeClientsResponse = (response) => {
        if (Array.isArray(response)) return response

        if (response?.data && Array.isArray(response.data)) {
            return response.data
        }

        if (response?.content && Array.isArray(response.content)) {
            return response.content
        }

        return []
    }

    const loadClients = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await clientService.getClients()
            const list = normalizeClientsResponse(response)

            setClients(list)
            setPagination((prev) => ({
                ...prev,
                page: 1,
            }))
        } catch (err) {
            console.error('Failed to load clients:', err)
            setError(err.message || 'Failed to load clients.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadClients()
    }, [loadClients])

    const filteredClients = useMemo(() => {
        const query = debouncedSearch.toLowerCase().trim()

        return clients.filter((client) => {
            if (!query) return true

            const name = client.name?.toLowerCase() || ''
            const fullName = client.fullName?.toLowerCase() || ''
            const email = client.email?.toLowerCase() || ''
            const phone = client.phone?.toLowerCase() || ''
            const address = client.address?.toLowerCase() || ''

            return (
                name.includes(query) ||
                fullName.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                address.includes(query)
            )
        })
    }, [clients, debouncedSearch])

    const paginatedClients = useMemo(() => {
        const start = (pagination.page - 1) * PAGE_LIMIT
        return filteredClients.slice(start, start + PAGE_LIMIT)
    }, [filteredClients, pagination.page])

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: filteredClients.length,
            totalPages: Math.max(1, Math.ceil(filteredClients.length / PAGE_LIMIT)),
            page: Math.min(prev.page, Math.max(1, Math.ceil(filteredClients.length / PAGE_LIMIT))),
        }))
    }, [filteredClients.length])

    const stats = useMemo(() => {
        const totalDebt = clients.reduce((sum, client) => {
            const debt = Number(
                client.totalDebt ??
                client.total_debt ??
                client.outstandingDebt ??
                client.outstanding_debt ??
                client.debt ??
                0
            )

            return sum + debt
        }, 0)

        const totalRevenue = clients.reduce((sum, client) => {
            const revenue = Number(
                client.totalRevenue ??
                client.total_revenue ??
                client.totalPurchases ??
                client.total_purchases ??
                client.totalSpent ??
                0
            )

            return sum + revenue
        }, 0)

        const debtors = clients.filter((client) => {
            const debt = Number(
                client.totalDebt ??
                client.total_debt ??
                client.outstandingDebt ??
                client.outstanding_debt ??
                client.debt ??
                0
            )

            return debt > 0
        }).length

        return {
            totalRevenue,
            totalDebt,
            debtors,
            totalClients: clients.length,
        }
    }, [clients])

    const handleSave = async (formData) => {
        try {
            if (editingClient) {
                await clientService.updateClient(editingClient.id, formData)
                toast.success('Client updated successfully')
            } else {
                await clientService.createClient(formData)
                toast.success('Client added successfully')
            }

            setEditingClient(null)
            setModalOpen(false)
            loadClients()
        } catch (err) {
            console.error('Failed to save client:', err)
            toast.error(err.message || 'Failed to save client')
            throw err
        }
    }

    const handleDelete = async () => {
        try {
            await clientService.deleteClient(deleteTarget.id)
            toast.success('Client removed successfully')
            setDeleteTarget(null)
            loadClients()
        } catch (err) {
            console.error('Failed to delete client:', err)
            toast.error(err.message || 'Failed to delete client')
        }
    }

    const openCreate = () => {
        setEditingClient(null)
        setModalOpen(true)
    }

    const openEdit = (client) => {
        setEditingClient(client)
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
                    <h1 className="page-title">Clients</h1>
                    <p className="text-sm text-text-muted mt-1">
                        {stats.totalClients} clients registered
                    </p>
                </div>

                <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
                    Add client
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total client revenue',
                        value: formatCurrency(stats.totalRevenue),
                        color: 'text-primary',
                    },
                    {
                        label: 'Outstanding debt',
                        value: formatCurrency(stats.totalDebt),
                        color: 'text-red-500',
                    },
                    {
                        label: 'Clients with debt',
                        value: stats.debtors,
                        color: 'text-amber-500',
                    },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-text-muted mb-0.5">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>

                        <Users size={22} className={s.color + ' opacity-30'} />
                    </div>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="p-5 border-b border-border">
                    <div className="max-w-sm">
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPagination((prev) => ({ ...prev, page: 1 }))
                            }}
                            placeholder="Search clients…"
                            leftIcon={<Search size={15} />}
                            rightIcon={
                                search ? (
                                    <button type="button" onClick={() => setSearch('')}>
                                        <X size={14} />
                                    </button>
                                ) : null
                            }
                        />
                    </div>
                </div>

                {error ? (
                    <ErrorMessage message={error} onRetry={loadClients} />
                ) : (
                    <ClientTable
                        clients={paginatedClients}
                        pagination={pagination}
                        isLoading={isLoading}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onViewDebt={setDebtClient}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <ClientModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                client={editingClient}
                onSave={handleSave}
            />

            <DebtDetailsModal
                isOpen={Boolean(debtClient)}
                onClose={() => setDebtClient(null)}
                client={debtClient}
            />

            <Modal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Remove Client"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>

                        <Button variant="danger" onClick={handleDelete}>
                            Remove
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-text-secondary">
                    Remove <strong className="text-text-primary">{deleteTarget?.name}</strong>{' '}
                    from your client list? Their transaction history will be preserved.
                </p>
            </Modal>
        </div>
    )
}