import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-3 rounded-full bg-red-50">
                <AlertCircle size={28} className="text-red-400" />
            </div>
            <div className="text-center">
                <p className="font-medium text-text-primary mb-1">Failed to load data</p>
                <p className="text-sm text-text-muted max-w-xs">{message}</p>
            </div>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>
                    Try again
                </Button>
            )}
        </div>
    )
}