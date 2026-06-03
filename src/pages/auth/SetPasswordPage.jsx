import SetPasswordForm from '../../components/auth/SetPasswordForm'

export default function SetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Set password</h1>
                    <p className="text-text-muted mt-2">Create your new password</p>
                </div>

                <SetPasswordForm />
            </div>
        </div>
    )
}