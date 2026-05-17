import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, Store, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [form, setForm] = useState({
        whatsappNumber: '',
        shopName: '',
        ownerName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!form.whatsappNumber) newErrors.whatsappNumber = 'WhatsApp number is required'
        else if (!form.whatsappNumber.match(/^\+?[0-9]{10,15}$/)) {
            newErrors.whatsappNumber = 'Enter a valid phone number (e.g., +212600000001)'
        }

        if (!form.shopName) newErrors.shopName = 'Shop name is required'
        if (!form.ownerName) newErrors.ownerName = 'Owner name is required'
        if (!form.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'

        if (!form.password) newErrors.password = 'Password is required'
        else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)
        try {
            // Send data in the format backend expects
            const registerData = {
                whatsappNumber: form.whatsappNumber,
                shopName: form.shopName,
                ownerName: form.ownerName,
                email: form.email,
                password: form.password
            }

            await register(registerData)
            toast.success('Account created! Welcome aboard.')
            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.error('Registration error:', err)
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join CommerceHub today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="WhatsApp Number"
                        name="whatsappNumber"
                        type="tel"
                        value={form.whatsappNumber}
                        onChange={handleChange}
                        placeholder="+212600000001"
                        error={errors.whatsappNumber}
                        required
                        leftIcon={<Phone size={16} />}
                    />

                    <Input
                        label="Shop Name"
                        name="shopName"
                        type="text"
                        value={form.shopName}
                        onChange={handleChange}
                        placeholder="My Boutique"
                        error={errors.shopName}
                        required
                        leftIcon={<Store size={16} />}
                    />

                    <Input
                        label="Owner Name"
                        name="ownerName"
                        type="text"
                        value={form.ownerName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        error={errors.ownerName}
                        required
                        leftIcon={<User size={16} />}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        error={errors.email}
                        required
                        leftIcon={<Mail size={16} />}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        error={errors.password}
                        required
                        leftIcon={<Lock size={16} />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        error={errors.confirmPassword}
                        required
                        leftIcon={<Lock size={16} />}
                    />

                    <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                        Create account
                    </Button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}