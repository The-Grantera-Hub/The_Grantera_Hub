import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

const useAffiliateApplicants = (affiliatesData) => {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!affiliatesData?.uid) return

    const affiliatesRef = collection(
      db,
      'affiliates',
      affiliatesData.uid,
      'submissions'
    )

    const unsubscribe = onSnapshot(affiliatesRef, async (snapshot) => {
      setLoading(true)

      // Track changes in subcollection
      // snapshot.docChanges().forEach((change) => {
      //   if (change.type === 'added') {
      //     console.log('New applicant added: ', change.doc.data())
      //   }
      //   if (change.type === 'modified') {
      //     console.log('Applicant updated: ', change.doc.data())
      //   }
      //   if (change.type === 'removed') {
      //     console.log('Applicant removed: ', change.doc.data())
      //   }
      // })

      // Get full applicant data
      const referredApplicantsData = snapshot.docs.map((doc) => doc.data())

      setApplicants(referredApplicantsData)

      /*  const applicantDataPromises = referredApplicantsUIds.map(async (uid) => {
        const applicantDoc = await getDoc(doc(db, 'applicants', uid))
        return applicantDoc.exists()
          ? { id: uid, ...applicantDoc.data() }
          : null
      })

      const allApplicantData = (
        await Promise.all(applicantDataPromises)
      ).filter(Boolean)

      setApplicants(allApplicantData) */
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [affiliatesData])

  return { applicants, loading }
}

export default useAffiliateApplicants
