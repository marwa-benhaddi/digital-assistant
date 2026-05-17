const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral',
    default: 'badge-neutral',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={`${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
    )
}

export function StatusBadge({ status }) {
    const map = {
        completed: { variant: 'success', label: 'Completed' },
        pending: { variant: 'warning', label: 'Pending' },
        cancelled: { variant: 'error', label: 'Cancelled' },
        refunded: { variant: 'info', label: 'Refunded' },
        active: { variant: 'success', label: 'Active' },
        inactive: { variant: 'neutral', label: 'Inactive' },
        low_stock: { variant: 'warning', label: 'Low Stock' },
        out_of_stock: { variant: 'error', label: 'Out of Stock' },
        in_stock: { variant: 'success', label: 'In Stock' },
    }
    const config = map[status?.toLowerCase()] || { variant: 'neutral', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
}