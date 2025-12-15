import { TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'

export function StatsCards({ affiliatesData }) {
  const stats = [
    {
      label: 'Total Referrals',
      value: affiliatesData ? affiliatesData.totalInvited : 'unavailable',
      icon: TrendingUp,
      color: 'bg-blue-100',
      iconColor: 'text-[#002F6C]',
    },
    {
      label: 'Pending Applications',
      value: affiliatesData ? affiliatesData.pending : 'unavailable',
      icon: Clock,
      color: 'bg-yellow-100',
      iconColor: 'text-[#f59e0b]',
    },
    {
      label: 'Approved Applications',
      value: affiliatesData ? affiliatesData.approved : 'unavailable',
      icon: CheckCircle2,
      color: 'bg-green-100',
      iconColor: 'text-[#10b981]',
    },
    {
      label: 'Rejected Applications',
      value: affiliatesData ? affiliatesData.rejected : 'unavailable',
      icon: XCircle,
      color: 'bg-red-100',
      iconColor: 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div
              className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}
            >
              <Icon size={24} className={stat.iconColor} />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">
              {stat.label}
            </p>
            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}
