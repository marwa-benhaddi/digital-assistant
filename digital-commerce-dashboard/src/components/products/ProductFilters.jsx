import { Search, X } from 'lucide-react'
import Input, { Select } from '../common/Input'
import Button from '../common/Button'
import { PRODUCT_CATEGORIES } from '../../utils/constants'

const categoryOptions = [{ value: '', label: 'All Categories' }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))]
const stockOptions = [
    { value: '', label: 'All Stock' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
]
const sortOptions = [
    { value: 'created_at:desc', label: 'Newest First' },
    { value: 'created_at:asc', label: 'Oldest First' },
    { value: 'name:asc', label: 'Name (A–Z)' },
    { value: 'name:desc', label: 'Name (Z–A)' },
    { value: 'price:asc', label: 'Price (Low–High)' },
    { value: 'price:desc', label: 'Price (High–Low)' },
]

export default function ProductFilters({ filters, onChange, onReset }) {
    const hasActiveFilters = filters.search || filters.category || filters.stock || filters.sort

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
                <Input
                    value={filters.search || ''}
                    onChange={(e) => onChange({ search: e.target.value })}
                    placeholder="Search products…"
                    leftIcon={<Search size={15} />}
                    rightIcon={
                        filters.search ? (
                            <button onClick={() => onChange({ search: '' })} className="text-text-muted hover:text-text-primary">
                                <X size={14} />
                            </button>
                        ) : null
                    }
                />
            </div>

            <Select
                value={filters.category || ''}
                onChange={(e) => onChange({ category: e.target.value })}
                options={categoryOptions}
                className="sm:w-44"
            />

            <Select
                value={filters.stock || ''}
                onChange={(e) => onChange({ stock: e.target.value })}
                options={stockOptions}
                className="sm:w-36"
            />

            <Select
                value={filters.sort || ''}
                onChange={(e) => onChange({ sort: e.target.value })}
                options={sortOptions}
                className="sm:w-44"
            />

            {hasActiveFilters && (
                <Button variant="ghost" size="md" onClick={onReset} leftIcon={<X size={15} />}>
                    Reset
                </Button>
            )}
        </div>
    )
}