import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'

export default function useMonthlyAffiliateStats(uid, refCode) {
  const [monthlyReferrals, setMonthlyReferrals] = useState(0)

  useEffect(() => {
    if (!uid || !refCode) return

    // 🔹 Get first day of THIS month
    const now = new Date()
    const day = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDay = Timestamp.fromDate(day)

    const colRef = collection(db, 'affiliates', uid, 'submissions')

    // 🔹 Query for only documents updated THIS month
    const qRef = query(colRef, where('createdAt', '>=', firstDay))

    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      let referrals = 0

      snapshot.forEach((doc) => {
        referrals++
      })

      setMonthlyReferrals(referrals)
    })

    return unsubscribe
  }, [uid, refCode])

  return { monthlyReferrals }
}
