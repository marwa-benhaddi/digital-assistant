import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardHome from './pages/DashboardHome'
import ProductsPage from './pages/ProductsPage'
import ClientsPage from './pages/ClientsPage'
import SalesPage from './pages/SalesPage'
import StockAlertsPage from './pages/StockAlertsPage'
import MessagesPage from './pages/MessagesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import { ROUTES } from './utils/constants'

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public routes */}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
                        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
                        <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
                        <Route path={ROUTES.SALES} element={<SalesPage />} />
                        <Route path={ROUTES.STOCK_ALERTS} element={<StockAlertsPage />} />
                        <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
                        <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                    </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
        </AuthProvider>
    )
}