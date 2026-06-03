import VerifyResetCodeForm from '../../components/auth/VerifyResetCodeForm'

export default function VerifyResetCodePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Verify code</h1>
                    <p className="text-text-muted mt-2">Enter the code sent to WhatsApp</p>
                </div>

                <VerifyResetCodeForm />
            </div>
        </div>
    )
}