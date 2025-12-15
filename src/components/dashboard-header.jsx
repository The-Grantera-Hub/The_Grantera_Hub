import { useEffect, useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'
export function DashboardHeader({ affiliatesData }) {
  const [affiliateInfo, setAffiliateInfo] = useState(null)
  const [copied, setCopied] = useState(null)


  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const uid = user.uid
  //       const userRef = doc(db, 'affiliates', uid)
  //       const unsubscribe = onSnapshot(userRef, (doc) => {
  //         if (doc.exists()) {
  //           setAffiliateData(doc.data())
  //         }
  //       })
  //       return () => unsubscribe()
  //     }
  //   })
  // }, [])
  useEffect(() => {
    setAffiliateInfo(affiliatesData)
  }, [affiliatesData])

  const handleCopy = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  if (!affiliateInfo) return null

  return (
    <div className="mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Welcome, {affiliateInfo.fullName.split(' ')[0]}! 👋
      </h1>
      <p className="text-gray-600 mb-8">
        Track your referrals and earnings in real-time
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-600 font-medium mb-3">
            Your Referral Code
          </p>
          <div className="flex items-center gap-3 mb-4">
            <code className="bg-gray-100 px-4 py-3 rounded-lg font-mono font-bold text-[#002F6C]">
              {affiliateInfo.referralCode}
            </code>
            <button
              onClick={() => handleCopy(affiliateInfo.referralCode, 'code')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied === 'code' ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : (
                <Copy size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-600 font-medium mb-3">
            Your Referral Link
          </p>
          <div className="flex items-center gap-2 mb-4">
            <div
              href={affiliateInfo.referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 px-4 py-3 rounded-lg text-sm text-[#002F6C] font-medium truncate hover:underline"
            >
              {affiliateInfo?.referralLink?.substring(0, 30)}...
              <a>
                <button
                  onClick={() => handleCopy(affiliateInfo.referralLink, 'link')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied === 'link' ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Copy size={20} className="text-gray-600" />
                  )}
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
