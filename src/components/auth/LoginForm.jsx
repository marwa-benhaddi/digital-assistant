import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../common/Button'
import Input from '../common/Input'
import { validateLogin } from '../../utils/validators'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function LoginForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD

    const [form, setForm] = useState({ email: '', password: '' })
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

        const validationErrors = validateLogin(form)

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            await login(form)
            toast.success('Welcome back!')
            navigate(from, { replace: true })
        } catch (err) {
            toast.error(err.message || 'Invalid credentials. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                placeholder="Enter your password"
                error={errors.password}
                required
                autoComplete="current-password"
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

            <div className="flex justify-end -mt-2">
                <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                Sign in
            </Button>

            <p className="text-center text-sm text-text-muted">
                Don&apos;t have an account?{' '}
                <Link
                    to={ROUTES.REGISTER}
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Create one
                </Link>
            </p>
        </form>
    )
}