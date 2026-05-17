import { useState, useEffect, useCallback } from 'react'
import clientService from '../services/clientService'
import toast from 'react-hot-toast'

export function useClients(initialParams = {}) {
    const [clients, setClients] = useState([])
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [params, setParams] = useState(initialParams)

    const fetchClients = useCallback(async (fetchParams = {}) => {
        setIsLoading(true)
        setError(null)
        try {
            const mergedParams = { ...params, ...fetchParams }
            const data = await clientService.getClients(mergedParams)
            setClients(data.clients || data.data || [])
            if (data.pagination) setPagination(data.pagination)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [params])

    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    const createClient = useCallback(async (clientData) => {
        const data = await clientService.createClient(clientData)
        toast.success('Client added successfully')
        fetchClients()
        return data
    }, [fetchClients])

    const updateClient = useCallback(async (id, clientData) => {
        const data = await clientService.updateClient(id, clientData)
        toast.success('Client updated successfully')
        fetchClients()
        return data
    }, [fetchClients])

    const deleteClient = useCallback(async (id) => {
        await clientService.deleteClient(id)
        toast.success('Client removed')
        fetchClients()
    }, [fetchClients])

    const updateParams = useCallback((newParams) => {
        setParams((prev) => ({ ...prev, ...newParams }))
    }, [])

    return {
        clients,
        pagination,
        isLoading,
        error,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
        updateParams,
    }
}

export default useClients