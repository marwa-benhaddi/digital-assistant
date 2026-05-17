import { forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
}

const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
}

const Button = forwardRef(function Button(
    {
        children,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        leftIcon = null,
        rightIcon = null,
        className = '',
        disabled,
        ...props
    },
    ref,
) {
    const variantClass = variants[variant] || variants.primary
    const sizeClass = sizes[size] || sizes.md

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <LoadingSpinner size="sm" color={variant === 'secondary' ? 'primary' : 'white'} />
                    <span>Loading…</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    )
})

export default Button