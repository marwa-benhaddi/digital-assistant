import { forwardRef } from 'react'

const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        leftIcon,
        rightIcon,
        className = '',
        containerClass = '',
        required = false,
        ...props
    },
    ref,
) {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClass}`}>
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center">
            {leftIcon}
          </span>
                )}
                <input
                    ref={ref}
                    className={`input-field ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${
                        error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                    } ${className}`}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center">
            {rightIcon}
          </span>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
        </div>
    )
})

export const Select = forwardRef(function Select(
    { label, error, hint, options = [], placeholder, className = '', containerClass = '', required = false, ...props },
    ref,
) {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClass}`}>
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <select
                ref={ref}
                className={`input-field appearance-none bg-white ${
                    error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                } ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
        </div>
    )
})

export const Textarea = forwardRef(function Textarea(
    { label, error, hint, className = '', containerClass = '', required = false, rows = 4, ...props },
    ref,
) {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClass}`}>
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`input-field resize-none ${
                    error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                } ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
        </div>
    )
})

export default Input