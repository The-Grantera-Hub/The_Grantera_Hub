import { useCallback, useRef } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { toast } from 'sonner' // or your toast lib
import { useSpinner } from './SpinnerProvider'

export function useRetryAI() {
  // keep a stable ref to the callable function
  const retryAIRef = useRef(null)
  const { alertMsg, setAlertMsg } = useSpinner()

  // initialize only once
  if (!retryAIRef.current) {
    const functions = getFunctions()
    retryAIRef.current = httpsCallable(functions, 'retryAIProcessing')
  }

  // stable callback that can be safely passed around (no re-renders)
  const handleRetryAI = useCallback(async (applicantId) => {
    if (!applicantId) {
      toast.error('Missing applicant ID')
      return
    }

    try {
      const retryAIProcessing = retryAIRef.current
      const res = await retryAIProcessing({ applicantId: applicantId })

      if (res?.data?.success) {
        toast.success('AI processing retried successfully!')
        return setAlertMsg({
          ...alertMsg,
          open: true,
          status: true,
          msg: `AI retry successful for ${applicantId}`,
          statusMsg: 'AI Retry Success',
        })
      } else {
        console.log('retry err', res.data)
        toast.error(`Retry failed: ${res?.data?.error || 'Unknown error'}`)
        return setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: res.data.error,
          statusMsg: 'AI Retry failed',
        })
      }
    } catch (err) {
      toast.error(`Error calling retry function: ${err.message}`)
      console.error('[handleRetryAI]', err)
      return setAlertMsg({
        ...alertMsg,
        open: true,
        status: false,
        msg: err.message,
        statusMsg: 'Error Occured Upon AI Retry ',
      })
    }
  }, [])

  return handleRetryAI
}
