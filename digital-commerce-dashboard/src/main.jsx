import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: '#fff',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
                    },
                    success: {
                        iconTheme: { primary: '#4ADE80', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#EF4444', secondary: '#fff' },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>,
)