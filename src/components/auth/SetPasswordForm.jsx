import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function SetPasswordForm() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const token = searchParams.get('token')

    const [form, setForm] = useState({
        newPassword: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({})
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const nextErrors = {}

        if (!token) {
            toast.error('Reset token missing')
            return
        }

        if (!form.newPassword) {
            nextErrors.newPassword = 'New password is required'
        } else if (form.newPassword.length < 6) {
            nextErrors.newPassword = 'Password must contain at least 6 characters'
        }

        if (!form.confirmPassword) {
            nextErrors.confirmPassword = 'Confirm password is required'
        } else if (form.newPassword !== form.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match'
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: form.newPassword,
                    confirmPassword: form.confirmPassword,
                }),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password')
            }

            toast.success('Password reset successfully')

            navigate(ROUTES.LOGIN, { replace: true })
        } catch (err) {
            toast.error(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
                label="New password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                error={errors.newPassword}
                required
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="text-text-muted hover:text-text-secondary transition-colors"
                    >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                }
            />

            <Input
                label="Confirm password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="text-text-muted hover:text-text-secondary transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                }
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                Set password
            </Button>

            <p className="text-center text-sm text-text-muted">
                Back to{' '}
                <Link
                    to={ROUTES.LOGIN}
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </form>
    )
}