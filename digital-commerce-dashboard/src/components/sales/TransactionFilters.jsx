import { Search, X } from 'lucide-react'
import Input, { Select } from '../common/Input'
import Button from '../common/Button'
import { TRANSACTION_STATUSES } from '../../utils/constants'

const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: TRANSACTION_STATUSES.COMPLETED, label: 'Completed' },
    { value: TRANSACTION_STATUSES.PENDING, label: 'Pending' },
    { value: TRANSACTION_STATUSES.CANCELLED, label: 'Cancelled' },
    { value: TRANSACTION_STATUSES.REFUNDED, label: 'Refunded' },
]

const sortOptions = [
    { value: 'created_at:desc', label: 'Newest First' },
    { value: 'created_at:asc', label: 'Oldest First' },
    { value: 'total:desc', label: 'Highest Amount' },
    { value: 'total:asc', label: 'Lowest Amount' },
]

export default function TransactionFilters({ filters, onChange, onReset }) {
    const hasFilters = filters.search || filters.status || filters.dateFrom || filters.dateTo

    return (
        <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-52">
                <Input
                    value={filters.search || ''}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Search by client or order ID…"
                    leftIcon={<Search size={15} />}
                    rightIcon={filters.search ? <button onClick={() => onChange({ search: '' })}><X size={14} /></button> : null}
                />
            </div>

            <Select
                value={filters.status || ''}
                onChange={(e) => onChange({ status: e.target.value })}
                options={statusOptions}
                className="w-40"
            />

            <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onChange({ dateFrom: e.target.value })}
                placeholder="From"
                className="w-40"
            />

            <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onChange({ dateTo: e.target.value })}
                placeholder="To"
                className="w-40"
            />

            <Select
                value={filters.sort || ''}
                onChange={(e) => onChange({ sort: e.target.value })}
                options={sortOptions}
                className="w-44"
            />

            {hasFilters && (
                <Button variant="ghost" onClick={onReset} leftIcon={<X size={15} />}>
                    Reset
                </Button>
            )}
        </div>
    )
}