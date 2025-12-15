import { db } from '@/firebaseConfig'
import { onSnapshot, collection } from 'firebase/firestore'
import { Users, DollarSign, } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AffiliateStats() {
  const [affiliatesNetwork, setAffiliatesNetwork] = useState({
    affiliatesCount: 0,
    totalInvited: 0,
  })

  useEffect(() => {
    const affiliatesRef = collection(db, 'affiliatesSummary')

    const unsubscribe = onSnapshot(affiliatesRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data())
      setAffiliatesNetwork(data)

      // Total Affiliates
      const totalAffiliates = data.length

      // Sum of all invited for all affiliates
      const totalInvitedSum = data.reduce((sum, aff) => {
        const invited = aff?.totalInvited || 0
        return sum + invited
      }, 0)

      // Set state (optional for dashboard)
      setAffiliatesNetwork({
        affiliatesCount: totalAffiliates,
        totalInvited: totalInvitedSum,
      })
    })

    return unsubscribe
  }, [])

  const stats = [
    {
      label: 'Total Affiliates',
      value: affiliatesNetwork?.affiliatesCount,
      icon: Users,
      color: 'bg-blue-100',
      iconColor: 'text-[#002F6C]',
      /*  trend: '+12 this month', */
    },
    {
      label: 'Total Commissions',
      value: `₦${(affiliatesNetwork?.totalInvited * 500).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-100',
      iconColor: 'text-[#fbbf24]',
      /*  trend: '+$3,240 pending', */
    },
  ]

  if (!affiliatesNetwork) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                <Icon size={24} className={stat.iconColor} />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.trend}</p>
          </div>
        )
      })}
    </div>
  )
}
