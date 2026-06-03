import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password });
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="bg-surface border border-border p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">
                        Commerce Assistant
                    </h1>
                    <p className="text-text-muted mt-2">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-border rounded-lg bg-surface-alt text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                            placeholder="owner@shop.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-border rounded-lg bg-surface-alt text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex justify-end -mt-4">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-6 text-text-muted">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/register"
                        className="text-primary hover:text-primary-dark font-semibold"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
``