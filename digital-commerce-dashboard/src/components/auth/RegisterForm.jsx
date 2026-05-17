import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../common/Button'
import Input from '../common/Input'
import { validateRegister } from '../../utils/validators'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function RegisterForm() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validateRegister(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)
        try {
            await register(form)
            toast.success('Account created! Welcome aboard.')
            navigate(ROUTES.DASHBOARD, { replace: true })
        } catch (err) {
            toast.error(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
                label="Full name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                error={errors.name}
                required
                autoComplete="name"
                leftIcon={<User size={16} />}
            />

            <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                required
                autoComplete="email"
                leftIcon={<Mail size={16} />}
            />

            <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                error={errors.password}
                required
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-text-muted hover:text-text-secondary transition-colors"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                }
            />

            <Input
                label="Confirm password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                Create account
            </Button>

            <p className="text-center text-sm text-text-muted">
                Already have an account?{' '}
                <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-dark font-medium transition-colors">
                    Sign in
                </Link>
            </p>
        </form>
    )
}