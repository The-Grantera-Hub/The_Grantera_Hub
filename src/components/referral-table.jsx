import { useEffect } from 'react'
import useAffiliateApplicants from './populate-affiliate-table'
import { useSpinner } from './SpinnerProvider'
import { FileMinus } from 'lucide-react'

export function ReferralTable({ affiliatesData }) {
  const { setAppContext } = useSpinner()
  const { applicants, loading } = useAffiliateApplicants(affiliatesData)

  useEffect(() => {
    setAppContext((prev) => ({
      ...prev,
      spinner: loading,
    }))
  }, [loading])

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Your Referrals</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-h-[30vh] relative">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Applicant Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Application ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Submission Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Grant Amount(₦)
              </th>
            </tr>
          </thead>

          <tbody>
            {/* EMPTY STATE FIX */}
            {!loading && applicants.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-700 flex flex-col items-center justify-center"
                >
                  <FileMinus className="mb-2" />
                  No applicants found
                </td>
              </tr>
            )}

            {/* APPLICANTS */}
            {applicants.map((referral, idx) => (
              <tr
                key={referral?.uniqueCode}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {referral?.applicantName}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {referral?.applicantId}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {referral?.createdAt?.toDate
                    ? referral.createdAt.toDate().toISOString().split('T')[0]
                    : '—'}
                </td>

                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      referral?.status
                    )}`}
                  >
                    {referral?.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {referral?.status === 'approved'
                    ? referral?.grantAmount.toLocaleString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default ReferralTable
