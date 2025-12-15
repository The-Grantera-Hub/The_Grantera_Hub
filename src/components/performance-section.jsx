import { useEffect, useState } from 'react'
import useMonthlyAffiliateStats from './monthly-Affiliate-Stats'

export function PerformanceSection({ affiliatesData }) {
  const [percentage, setPercentage] = useState(0)
  const { monthlyReferrals } = useMonthlyAffiliateStats(
    affiliatesData?.uid,
    affiliatesData?.referralCode
  )
  const [affData, setAffiliatesData] = useState({
    calculatedEarnings: 0,
    conversionRate: 0,
  })
  useEffect(() => {
    if (!affiliatesData) return
    const monthlyRefBar = Math.ceil((monthlyReferrals / 20000) * 100)
    const totalReferred = affiliatesData?.totalInvited
    const calculatedEarnings = totalReferred * 500
    const approved = affiliatesData?.approved
    const conversionRate = totalReferred
      ? ((approved / totalReferred) * 100).toFixed(1)
      : 0
    setPercentage(monthlyRefBar > 100 ? 100 : monthlyRefBar)
    setAffiliatesData((prevData) => ({
      ...prevData,
      calculatedEarnings,
      conversionRate,
    }))
  }, [affiliatesData])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 cursor-default">
      {/* Conversion Rate */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conversion Rate
        </h3>
        <div className="text-5xl font-bold text-[#10b981] mb-2">{`${affData.conversionRate}%`}</div>
        <p className="text-sm text-gray-600">Of your referrals get approved</p>
        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#002F6C] to-[#10b981]"
            style={{ width: `${affData.conversionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Monthly Referrals */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
        <div className="-space-y-0.5">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Referrals</span>
              <span className="text-sm font-semibold text-gray-900">
                {monthlyReferrals}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#002F6C]"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          {/*  <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-sm font-semibold text-gray-900">5</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10b981]"
                style={{ width: '42%' }}
              ></div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-gradient-to-br from-[#002F6C] to-[#10b981] rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 ">Calculated Earnings</h3>
        <div
          className="text-5xl font-bold mb-3 truncate"
          title={`₦ ${affData?.calculatedEarnings.toLocaleString()}`}
        >
          {`₦ ${affData?.calculatedEarnings.toLocaleString()}`}
        </div>
        <p className="text-sm font-bold mb-2 truncate text-amber-100">
          Bank:
          <span className="font-normal text-white">{` ${affiliatesData?.bank}`}</span>
        </p>
        <p className="text-sm font-bold mb-2 truncate text-amber-100">
          Account Number:
          <span className="font-normal text-white">{` ${affiliatesData?.accountNumber}`}</span>
        </p>
        {/* <p className="text-white/80 text-sm">This month (pending approvals)</p> */}
        {/*   <button className="mt-6 bg-[#fbbf24] text-[#002F6C] px-4 py-2 rounded-lg font-semibold hover:bg-[#f59e0b] transition-colors text-sm">
          View Details →
        </button> */}
      </div>
    </div>
  )
}
