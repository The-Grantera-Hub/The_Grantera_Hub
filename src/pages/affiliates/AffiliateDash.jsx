import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatsCards } from '@/components/stats-cards'
import { ReferralTable } from '@/components/referral-table'
import { PerformanceSection } from '@/components/performance-section'
import { auth, db } from '@/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import {
  onSnapshot,
  doc
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function AffDashboardPage() {
  const navigate = useNavigate()
  const [uid, setUid] = useState(null)
  const [affiliatesData, setAffiliatesData] = useState(null)

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (user) => {
      // const getUserId = async () => {
      //   const affiliatesRef = collection(db, 'affiliates')
      //   const q = query(affiliatesRef, where('uid', '==', user.uid))
      //   const docSnap = await getDocs(q)
      //   if (!docSnap.exists) {
      //     setUid(docSnap?.docs[0]?.data()?.referralCode)
      //   }
      // }
      if (user) {
        setUid(user.uid)
      } else {
        setUid(null)
        toast.error('Please log in to access the affiliate dashboard.')
        navigate('/affiliatelogin')
      }
    })
    return () => unSubscribe()
  }, [])

  useEffect(() => {
    if (!uid) return
    const q = doc(db, 'affiliates', uid)
    const unSubscribe = onSnapshot(q, (snapShot) => {
      const data = snapShot.data()
      const entiresData = { uid, ...data }
      setAffiliatesData(entiresData)
    })
    return () => unSubscribe()
  }, [uid])
  return (
    <DashboardLayout>
      <DashboardHeader affiliatesData={affiliatesData} />
      <StatsCards affiliatesData={affiliatesData} />
      <PerformanceSection affiliatesData={affiliatesData} />
      <ReferralTable affiliatesData={affiliatesData} />
    </DashboardLayout>
  )
}
