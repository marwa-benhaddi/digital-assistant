/**
 * Validate an email address
 */
export const isValidEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email)
}

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
    return password && password.length >= 8
}

/**
 * Validate required field
 */
export const isRequired = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return true
    return Boolean(value)
}

/**
 * Validate a positive number
 */
export const isPositiveNumber = (value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num > 0
}

/**
 * Validate a non-negative integer
 */
export const isNonNegativeInteger = (value) => {
    const num = parseInt(value, 10)
    return !isNaN(num) && num >= 0 && Number.isInteger(num)
}

/**
 * Validate a phone number (loose check)
 */
export const isValidPhone = (phone) => {
    const pattern = /^\+?[\d\s\-().]{7,20}$/
    return pattern.test(phone)
}

/**
 * Validate product form data
 */
export const validateProduct = (data) => {
    const errors = {}

    if (!isRequired(data.name)) errors.name = 'Product name is required'
    else if (data.name.length > 120) errors.name = 'Name must be under 120 characters'

    if (!isRequired(data.category)) errors.category = 'Category is required'

    if (!isRequired(data.price)) errors.price = 'Price is required'
    else if (!isPositiveNumber(data.price)) errors.price = 'Price must be a positive number'

    if (data.stock !== undefined && data.stock !== '') {
        if (!isNonNegativeInteger(data.stock)) errors.stock = 'Stock must be a non-negative integer'
    }

    return errors
}

/**
 * Validate client form data
 */
export const validateClient = (data) => {
    const errors = {}

    if (!isRequired(data.name)) errors.name = 'Client name is required'
    if (!isRequired(data.email)) errors.email = 'Email is required'
    else if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address'

    if (data.phone && !isValidPhone(data.phone)) {
        errors.phone = 'Enter a valid phone number'
    }

    return errors
}

/**
 * Validate login form
 */
export const validateLogin = (data) => {
    const errors = {}
    if (!isRequired(data.email)) errors.email = 'Email is required'
    else if (!isValidEmail(data.email)) errors.email = 'Enter a valid email'
    if (!isRequired(data.password)) errors.password = 'Password is required'
    return errors
}

/**
 * Validate registration form
 */
export const validateRegister = (data) => {
    const errors = {}
    if (!isRequired(data.name)) errors.name = 'Full name is required'
    if (!isRequired(data.email)) errors.email = 'Email is required'
    else if (!isValidEmail(data.email)) errors.email = 'Enter a valid email'
    if (!isRequired(data.password)) errors.password = 'Password is required'
    else if (!isValidPassword(data.password)) errors.password = 'Password must be at least 8 characters'
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    return errors
}