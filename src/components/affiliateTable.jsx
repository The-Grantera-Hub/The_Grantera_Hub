import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

export function AffiliateTable() {
  const [affiliates, setAffiliates] = useState(null)

  //Name	Email	Referrals	Approved	Earnings	Status	Join Date

  useEffect(() => {
    const affiliatesRef = collection(db, 'affiliatesSummary')
    const q = query(
      affiliatesRef,
      orderBy('createdAt', 'desc') // 👈 sort newest → oldest
    )
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data())
      setAffiliates(data)
      // Process the data as needed
    })
  }, [])
  //   const [affiliates] = useState([
  //     {
  //       id: 1,
  //       name: 'Sarah Johnson',
  //       email: 'sarah@example.com',
  //       referrals: 24,
  //       approved: 12,
  //       earnings: '$3,240',
  //       status: 'Active',
  //       joinDate: '2024-01-15',
  //     },
  //     {
  //       id: 2,
  //       name: 'Michael Chen',
  //       email: 'michael@example.com',
  //       referrals: 18,
  //       approved: 8,
  //       earnings: '$2,160',
  //       status: 'Active',
  //       joinDate: '2024-01-20',
  //     },
  //     {
  //       id: 3,
  //       name: 'Emma Davis',
  //       email: 'emma@example.com',
  //       referrals: 32,
  //       approved: 15,
  //       earnings: '$4,050',
  //       status: 'Active',
  //       joinDate: '2024-01-10',
  //     },
  //     {
  //       id: 4,
  //       name: 'James Wilson',
  //       email: 'james@example.com',
  //       referrals: 8,
  //       approved: 3,
  //       earnings: '$810',
  //       status: 'Inactive',
  //       joinDate: '2024-02-01',
  //     },
  //     {
  //       id: 5,
  //       name: 'Lisa Martinez',
  //       email: 'lisa@example.com',
  //       referrals: 45,
  //       approved: 22,
  //       earnings: '$5,940',
  //       status: 'Active',
  //       joinDate: '2023-12-20',
  //     },
  //   ])

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
  }
  if (!affiliates) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 max-h-[500px] overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Affiliate Network
        </h3>
        {/* <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View All →
        </button> */}
      </div>

      <div className="overflow-x-auto relative overflow-y-auto h-44 pb-4">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Referrals
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Approved
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Join Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-slate-400 overflow-y-auto">
            {affiliates.map((affiliate) => (
              <tr
                key={affiliate.affiliateUid}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {affiliate.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {affiliate.email}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {affiliate.totalInvited}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {affiliate.approved}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  {affiliate?.totalInvited
                    ? (affiliate?.totalInvited * 500).toLocaleString()
                    : 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      affiliate?.affiliateActivity ? 'Active' : 'Inactive'
                    )}`}
                  >
                    {affiliate?.affiliateActivity ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {affiliate?.createdAt?.toDate().toISOString().split('T')[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
