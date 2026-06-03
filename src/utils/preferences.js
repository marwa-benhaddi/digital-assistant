const PREFERENCES_KEY = 'app_preferences'

export const defaultPreferences = {
    currency: 'MAD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
}

export function getPreferences() {
    try {
        const raw = localStorage.getItem(PREFERENCES_KEY)
        return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences
    } catch {
        return defaultPreferences
    }
}

export function savePreferences(preferences) {
    const next = { ...defaultPreferences, ...preferences }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
    applyPreferences(next)
    window.dispatchEvent(new Event('preferences-changed'))
    return next
}

export function applyPreferences(preferences = getPreferences()) {
    const theme = preferences.theme || 'light'

    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.body.classList.toggle('dark', theme === 'dark')
    document.body.dataset.theme = theme
}