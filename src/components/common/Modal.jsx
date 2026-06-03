import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
}

export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  children,
                                  footer,
                                  size = 'md',
                                  closeOnBackdrop = true,
                              }) {
    const overlayRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === overlayRef.current) onClose()
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-2xl shadow-card-lg animate-slide-in`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-alt rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}