import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import { CHART_COLORS } from '../../utils/constants'
import LoadingSpinner from '../common/LoadingSpinner'

const COLORS = Object.values(CHART_COLORS)

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { name, revenue } = payload[0].payload
    return (
        <div className="bg-white border border-border rounded-xl shadow-card-md px-4 py-3 text-sm">
            <p className="font-semibold text-text-primary mb-1">{name}</p>
            <p className="text-text-muted">
                Revenue: <span className="font-medium text-text-primary">{formatCurrency(revenue)}</span>
            </p>
        </div>
    )
}

export default function TopProductsChart({ data, isLoading }) {
    return (
        <div className="card p-5">
            <div className="mb-6">
                <h2 className="section-title">Top Products</h2>
                <p className="text-sm text-text-muted mt-0.5">Best performers by revenue this month</p>
            </div>

            {isLoading ? (
                <div className="h-52 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="h-52 flex items-center justify-center">
                    <p className="text-sm text-text-muted">No product data available</p>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis
                                type="number"
                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#475569', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                width={108}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {data.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                                <span className="text-xs text-text-muted truncate">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}