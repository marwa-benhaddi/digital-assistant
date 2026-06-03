import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsCard({ title, value, change, changeLabel, icon: Icon, iconBg, isLoading }) {
    const isPositive = change >= 0

    if (isLoading) {
        return (
            <div className="card p-5 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-4 w-28 bg-border rounded" />
                    <div className="w-10 h-10 rounded-xl bg-border" />
                </div>
                <div className="h-8 w-32 bg-border rounded mb-2" />
                <div className="h-3 w-24 bg-border rounded" />
            </div>
        )
    }

    return (
        <div className="card p-5 hover:shadow-card-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>

            <p className="text-3xl font-bold text-text-primary tracking-tight mb-1.5">{value}</p>

            {change !== undefined && (
                <div className="flex items-center gap-1.5">
          <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                  isPositive ? 'text-secondary' : 'text-red-500'
              }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {isPositive ? '+' : ''}{change}%
          </span>
                    <span className="text-xs text-text-muted">{changeLabel || 'vs last month'}</span>
                </div>
            )}
        </div>
    )
}