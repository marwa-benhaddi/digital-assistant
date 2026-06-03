import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function ForgotPasswordForm() {
    const navigate = useNavigate()

    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')

        if (!whatsappNumber.trim()) {
            setError('WhatsApp number is required')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password-whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsappNumber: whatsappNumber.trim(),
                }),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send WhatsApp code')
            }

            toast.success('Code sent to WhatsApp')

            navigate(ROUTES.VERIFY_RESET_CODE, {
                state: {
                    whatsappNumber: whatsappNumber.trim(),
                },
            })
        } catch (err) {
            toast.error(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
                label="WhatsApp number"
                name="whatsappNumber"
                type="text"
                value={whatsappNumber}
                onChange={(e) => {
                    setWhatsappNumber(e.target.value)
                    if (error) setError('')
                }}
                placeholder="212600000000"
                error={error}
                required
                leftIcon={<Phone size={16} />}
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                Send code
            </Button>

            <p className="text-center text-sm text-text-muted">
                Remember your password?{' '}
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