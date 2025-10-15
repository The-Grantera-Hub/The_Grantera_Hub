import { useCallback, useRef } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebaseConfig'

const useRetry = () => {
  const retryWebHookRef = useRef(null)

  if (!retryWebHookRef.current) {
    retryWebHookRef.current = httpsCallable(functions, 'retryWebHook')
  }

  const WebHookRetry = useCallback(
    async (
      transaction_id,
      onSuccess,
      onFailure,
      onProgress, // 👈 NEW callback to show countdown updates
      maxRetries = 5
    ) => {
      let retryCount = 0
      let currentInterval = 3000 // Start with 3s
      const maxDelay = 10000 // 10s max
      let timeoutId

      const attemptRetry = async () => {
        retryCount++

        try {
          // Notify UI that a retry is starting
          onProgress?.({
            stage: 'retrying',
            retryCount,
            nextIn: currentInterval / 1000,
            message: `Checking payment status... (Attempt ${retryCount} of ${maxRetries})`,
          })

          const response = await retryWebHookRef.current({ transaction_id })

          if (response?.data?.status === 'success') {
            onProgress?.({
              stage: 'success',
              message: 'Payment confirmed! Refreshing your page...',
            })
            onSuccess?.(response.data)

            // Refresh after a short delay
            setTimeout(() => window.location.reload(), 2000)
            return { status: 'success' }
          }

          // Schedule next retry if not done yet
          if (retryCount < maxRetries) {
            const jitter = Math.random() * 1000
            currentInterval = Math.min(currentInterval * 2 + jitter, maxDelay)

            // Start countdown updates
            let countdown = Math.floor(currentInterval / 1000)
            const countdownTimer = setInterval(() => {
              countdown--
              if (countdown > 0) {
                onProgress?.({
                  stage: 'countdown',
                  retryCount,
                  nextIn: countdown,
                  message: `Rechecking in ${countdown}s...`,
                })
              } else {
                clearInterval(countdownTimer)
              }
            }, 1000)

            timeoutId = setTimeout(attemptRetry, currentInterval)
          } else {
            onFailure?.({ error: 'Max retries exceeded', retryCount })
            onProgress?.({
              stage: 'timeout',
              message:
                'Verification took too long. Please refresh the page to try again.',
            })
            return { status: 'error' }
          }
        } catch (error) {
          console.error(`Retry ${retryCount} failed:`, error)

          if (retryCount < maxRetries) {
            const jitter = Math.random() * 1000
            currentInterval = Math.min(currentInterval * 2 + jitter, maxDelay)
            timeoutId = setTimeout(attemptRetry, currentInterval)
          } else {
            onFailure?.({ error: error.message, retryCount })
            onProgress?.({
              stage: 'error',
              message:
                'Something went wrong verifying your payment. Please refresh.',
            })
            return { status: 'error' }
          }
        }
      }

      // Start immediately
      return attemptRetry()
    },
    []
  )

  return { WebHookRetry }
}

export default useRetry
