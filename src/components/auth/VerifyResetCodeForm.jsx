import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Phone } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { ROUTES } from '../../utils/constants'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function VerifyResetCodeForm() {
    const navigate = useNavigate()
    const location = useLocation()

    const [whatsappNumber, setWhatsappNumber] = useState(location.state?.whatsappNumber || '')
    const [code, setCode] = useState('')
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        const nextErrors = {}

        if (!whatsappNumber.trim()) {
            nextErrors.whatsappNumber = 'WhatsApp number is required'
        }

        if (!code.trim()) {
            nextErrors.code = 'Code is required'
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsappNumber: whatsappNumber.trim(),
                    code: code.trim(),
                }),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(data.message || 'Invalid or expired code')
            }

            toast.success('Code verified successfully')

            if (data.resetToken) {
                navigate(`${ROUTES.SET_PASSWORD}?token=${encodeURIComponent(data.resetToken)}`)
                return
            }

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl
                return
            }

            throw new Error('Reset token missing')
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
                    if (errors.whatsappNumber) {
                        setErrors((prev) => ({ ...prev, whatsappNumber: '' }))
                    }
                }}
                placeholder="212600000000"
                error={errors.whatsappNumber}
                required
                leftIcon={<Phone size={16} />}
            />

            <Input
                label="Verification code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value)
                    if (errors.code) {
                        setErrors((prev) => ({ ...prev, code: '' }))
                    }
                }}
                placeholder="123456"
                error={errors.code}
                required
                leftIcon={<KeyRound size={16} />}
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                Verify code
            </Button>

            <p className="text-center text-sm text-text-muted">
                Did not receive a code?{' '}
                <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Send again
                </Link>
            </p>
        </form>
    )
}