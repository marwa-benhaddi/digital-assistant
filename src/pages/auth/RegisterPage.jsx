import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import authService from '../../services/authService'
import Button from '../../components/common/Button'

export default function RegisterPage() {
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        ownerName: '',
        shopName: '',
        email: '',
        whatsappNumber: '',
        password: '',
        confirmPassword: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await authService.register({
                ownerName: formData.ownerName,
                shopName: formData.shopName,
                email: formData.email,
                whatsappNumber: formData.whatsappNumber,
                password: formData.password,
            })

            toast.success('Account created successfully. Please sign in.')
            navigate('/login')
        } catch (err) {
            console.error('Register error:', err)
            console.error('Register response:', err.response?.data)

            toast.error(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.data?.message ||
                err.message ||
                'Registration failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
            <div className="w-full max-w-md">
                <div className="card p-6">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
                        <p className="text-sm text-text-muted mt-1">
                            Register your shop account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Owner name
                            </label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Shop name
                            </label>
                            <input
                                type="text"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Your shop"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                WhatsApp number
                            </label>
                            <input
                                type="text"
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="212612345678"
                            />
                            <p className="text-xs text-text-muted mt-1">
                                Use numbers only, for example 212612345678.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Confirm password"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}