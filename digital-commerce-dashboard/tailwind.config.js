/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary colors
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    DEFAULT: '#0ea5e9',
                    dark: '#0284c7',
                },
                secondary: {
                    DEFAULT: '#4ade80',
                    light: '#86efac',
                    dark: '#22c55e',
                    soft: '#dcfce7',
                },
                // Surface colors (your custom ones)
                surface: {
                    DEFAULT: '#f8fafc',
                    alt: '#f1f5f9',
                },
                // Border colors
                border: {
                    DEFAULT: '#e2e8f0',
                    strong: '#cbd5e1',
                },
                // Text colors
                text: {
                    primary: '#0f172a',
                    secondary: '#334155',
                    muted: '#94a3b8',
                },
                // Additional utility colors
                'primary-soft': '#e0f2fe',
                'secondary-soft': '#dcfce7',
                'bg-primary': '#0ea5e9',
            },
        },
    },
    plugins: [],
}