import { useState } from 'react'
import { User, Lock, Bell, Globe, Palette, Shield, Save } from 'lucide-react'
import Button from '../components/common/Button'
import Input, { Select } from '../components/common/Input'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
]

function Toggle({ checked, onChange, label, description }) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-border-strong'}`}
                style={{ height: '22px', width: '42px' }}
            >
        <span
            className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            style={{ width: '18px', height: '18px' }}
        />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [isSaving, setIsSaving] = useState(false)

    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '', company: '', timezone: 'UTC', language: 'en' })
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
    const [notifications, setNotifications] = useState({ email_orders: true, email_stock: true, email_reports: false, push_orders: true, push_messages: true })
    const [prefs, setPrefs] = useState({ currency: 'USD', dateFormat: 'MM/DD/YYYY', theme: 'light' })

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 700))
        toast.success('Settings saved successfully')
        setIsSaving(false)
    }

    const handlePasswordSave = async () => {
        if (!passwords.current) { toast.error('Enter your current password'); return }
        if (passwords.newPass.length < 8) { toast.error('New password must be at least 8 characters'); return }
        if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return }
        setIsSaving(true)
        await new Promise((r) => setTimeout(r, 700))
        toast.success('Password updated successfully')
        setPasswords({ current: '', newPass: '', confirm: '' })
        setIsSaving(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Settings</h1>
                <p className="text-sm text-text-muted mt-1">Manage your account preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar nav */}
                <aside className="lg:w-52 flex-shrink-0">
                    <div className="card p-2">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    activeTab === id ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="card p-6 space-y-5">
                            <div>
                                <h2 className="section-title mb-0.5">Profile Information</h2>
                                <p className="text-sm text-text-muted">Update your personal details</p>
                            </div>

                            {/* Avatar */}
                            <div className="flex items-center gap-4 pb-5 border-b border-border">
                                <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary font-bold text-xl flex items-center justify-center flex-shrink-0">
                                    {profile.name.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <Button variant="secondary" size="sm">Change photo</Button>
                                    <p className="text-xs text-text-muted mt-1.5">JPG, PNG or GIF — max 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
                                <Input label="Email address" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                                <Input label="Phone" type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                                <Input label="Company" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." />
                                <Select
                                    label="Timezone"
                                    value={profile.timezone}
                                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                                    options={[
                                        { value: 'UTC', label: 'UTC (±0)' },
                                        { value: 'America/New_York', label: 'Eastern (UTC-5)' },
                                        { value: 'America/Los_Angeles', label: 'Pacific (UTC-8)' },
                                        { value: 'Europe/London', label: 'London (UTC+0)' },
                                        { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
                                        { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
                                    ]}
                                />
                                <Select
                                    label="Language"
                                    value={profile.language}
                                    onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}
                                    options={[
                                        { value: 'en', label: 'English' },
                                        { value: 'fr', label: 'Français' },
                                        { value: 'es', label: 'Español' },
                                        { value: 'ar', label: 'العربية' },
                                    ]}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>Save changes</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card p-6 space-y-5">
                            <div>
                                <h2 className="section-title mb-0.5">Password & Security</h2>
                                <p className="text-sm text-text-muted">Keep your account secure</p>
                            </div>

                            <div className="space-y-4">
                                <Input label="Current password" type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} placeholder="Enter current password" leftIcon={<Lock size={15} />} />
                                <Input label="New password" type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} placeholder="At least 8 characters" hint="Use uppercase, numbers, and symbols for a stronger password." leftIcon={<Lock size={15} />} />
                                <Input label="Confirm new password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter new password" leftIcon={<Lock size={15} />} />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handlePasswordSave} isLoading={isSaving} leftIcon={<Shield size={15} />}>Update password</Button>
                            </div>

                            {/* 2FA section */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <h3 className="text-sm font-semibold text-text-primary mb-1">Two-Factor Authentication</h3>
                                <p className="text-sm text-text-muted mb-4">Add an extra layer of security to your account.</p>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-alt border border-border">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Authenticator App</p>
                                        <p className="text-xs text-text-muted mt-0.5">Use an app like Google Authenticator</p>
                                    </div>
                                    <Button variant="secondary" size="sm">Enable</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card p-6">
                            <div className="mb-5">
                                <h2 className="section-title mb-0.5">Notification Preferences</h2>
                                <p className="text-sm text-text-muted">Choose what you want to be notified about</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Email Notifications</p>
                                <div className="divide-y divide-border">
                                    <Toggle checked={notifications.email_orders} onChange={(v) => setNotifications((n) => ({ ...n, email_orders: v }))} label="New orders" description="Receive an email whenever a new order is placed" />
                                    <Toggle checked={notifications.email_stock} onChange={(v) => setNotifications((n) => ({ ...n, email_stock: v }))} label="Stock alerts" description="Get notified when items are running low" />
                                    <Toggle checked={notifications.email_reports} onChange={(v) => setNotifications((n) => ({ ...n, email_reports: v }))} label="Weekly reports" description="Receive a summary of your weekly performance" />
                                </div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mt-5 mb-2">Push Notifications</p>
                                <div className="divide-y divide-border">
                                    <Toggle checked={notifications.push_orders} onChange={(v) => setNotifications((n) => ({ ...n, push_orders: v }))} label="Order updates" description="Real-time notifications for order status changes" />
                                    <Toggle checked={notifications.push_messages} onChange={(v) => setNotifications((n) => ({ ...n, push_messages: v }))} label="Client messages" description="Notifications when clients send you a message" />
                                </div>
                            </div>

                            <div className="flex justify-end mt-5">
                                <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>Save preferences</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="card p-6 space-y-5">
                            <div>
                                <h2 className="section-title mb-0.5">Display Preferences</h2>
                                <p className="text-sm text-text-muted">Customize how the dashboard looks and behaves</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Currency"
                                    value={prefs.currency}
                                    onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
                                    options={[
                                        { value: 'USD', label: 'USD — US Dollar' },
                                        { value: 'EUR', label: 'EUR — Euro' },
                                        { value: 'GBP', label: 'GBP — British Pound' },
                                        { value: 'MAD', label: 'MAD — Moroccan Dirham' },
                                        { value: 'AED', label: 'AED — UAE Dirham' },
                                    ]}
                                />
                                <Select
                                    label="Date format"
                                    value={prefs.dateFormat}
                                    onChange={(e) => setPrefs((p) => ({ ...p, dateFormat: e.target.value }))}
                                    options={[
                                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                                    ]}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-text-primary mb-3">Theme</p>
                                <div className="grid grid-cols-2 gap-3 max-w-xs">
                                    {['light', 'dark'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setPrefs((p) => ({ ...p, theme: t }))}
                                            className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                                                prefs.theme === t ? 'border-primary bg-primary-soft text-primary' : 'border-border text-text-muted hover:border-border-strong'
                                            }`}
                                        >
                                            {t === 'light' ? '☀️' : '🌙'} {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>Save preferences</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}