import { useState } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

const periods = [
    { label: '7D', value: '7days' },
    { label: '30D', value: '30days' },
    { label: '90D', value: '90days' },
    { label: '1Y', value: '1year' },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-border rounded-xl shadow-card-md px-4 py-3 text-sm">
            <p className="font-semibold text-text-primary mb-1.5">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-text-muted capitalize">{entry.dataKey}:</span>
                    <span className="font-medium text-text-primary">
            {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value}
          </span>
                </div>
            ))}
        </div>
    )
}

export default function SalesChart({ data, isLoading, onPeriodChange }) {
    const [activePeriod, setActivePeriod] = useState('30days')

    const handlePeriodChange = (period) => {
        setActivePeriod(period)
        onPeriodChange?.(period)
    }

    return (
        <div className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="section-title">Revenue Overview</h2>
                    <p className="text-sm text-text-muted mt-0.5">Track your sales performance over time</p>
                </div>
                <div className="flex items-center gap-1 bg-surface-alt rounded-xl p-1">
                    {periods.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                activePeriod === p.value
                                    ? 'bg-white text-primary shadow-card'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-text-muted">No sales data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={8}
                        />
                        <YAxis
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dx={-8}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#38BDF8"
                            strokeWidth={2.5}
                            fill="url(#revenueGrad)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#38BDF8', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}