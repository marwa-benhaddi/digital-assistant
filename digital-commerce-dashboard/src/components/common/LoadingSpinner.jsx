const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
}

const colors = {
    primary: 'border-primary',
    white: 'border-white',
    secondary: 'border-secondary',
    muted: 'border-text-muted',
}

export default function LoadingSpinner({ size = 'md', color = 'primary', className = '' }) {
    return (
        <div
            className={`${sizes[size] || sizes.md} rounded-full border-2 border-t-transparent animate-spin ${
                colors[color] || colors.primary
            } ${className}`}
            role="status"
            aria-label="Loading"
        />
    )
}

export function PageSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-text-muted">Loading…</p>
            </div>
        </div>
    )
}