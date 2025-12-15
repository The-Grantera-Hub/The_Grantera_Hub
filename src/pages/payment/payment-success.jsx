import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useSpinner } from '@/components/SpinnerProvider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Copy, Mail } from 'lucide-react'
import ApplicationSection from '@/components/sections/application-section'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebaseConfig'
import { toast } from 'sonner'
import FeedbackAlert from '@/components/Alert'

export default function PaymentSuccessPage() {
  const { appContext, setAppContext, alertMsg, setAlertMsg } = useSpinner()
  const [uniqueCode, setUniqueCode] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [verifyPay, setVerifyPay] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
  })

  const transactionReference = useMemo(
    () => localStorage.getItem('transactionReference'),
    []
  )

  // Refs for cloud functions to prevent recreation
  const verifyTransactionRef = useRef(null)
  const getUserCodeRef = useRef(null)

  // Initialize cloud functions once
  if (!verifyTransactionRef.current) {
    verifyTransactionRef.current = httpsCallable(
      functions,
      'verifyTransactionStatus'
    )
  }

  if (!getUserCodeRef.current) {
    getUserCodeRef.current = httpsCallable(functions, 'getUserUniqueCode')
  }

  // Memoized alert setter
  const showAlert = useCallback(
    (status, statusMsg, msg) => {
      setAlertMsg({
        ...alertMsg,
        open: true,
        status,
        statusMsg,
        msg,
      })
    },
    [alertMsg, setAlertMsg]
  )

  // Verify payment status
  const verifyPayment = useCallback(async () => {
    setAppContext((prev) => ({ ...prev, spinner: true }))

    try {
      const res = await verifyTransactionRef.current({
        transactionReference,
      })

      if (
        res.data?.status === 'success' &&
        res.data?.message === 'Transaction verified successfully'
      ) {
        setVerifyPay(true)
        return true
      }

      setVerifyPay(false)

      // Handle specific error cases
      {
        /* redo this later */
      }
      const errorHandlers = {
        'Request timed out': () => {
          showAlert(
            false,
            'Request Timeout',
            'Verification process took too long, please refresh the page.'
          )
          toast.error(
            'Verification process took too long, please refresh the page'
          )
        },
        "Unfortunately You didn't pay the right amount": () => {
          showAlert(
            false,
            'Incorrect Payment Amount',
            "Unfortunately You didn't pay the right amount."
          )
          toast.error(res.data.message)
        },
        'No transaction was found for this id': () => {
          showAlert(
            false,
            'Missing Transaction Records',
            'No transaction was found for this id.'
          )
          toast.error(`${res.data.message}: ${transactionReference}`)
        },
      }

      const handler = errorHandlers[res.data.message]
      if (handler) {
        handler()
      } else {
        showAlert(
          false,
          'Unfortunately an error occured while verifying your transaction.',
          `Sorry an error occured, please reach out to us at support@grantera.org with this Transaction_Reference: ${transactionReference}, and try refreshing the page to see if it can be resolved`
        )
        toast.error(
          `Sorry an error occured, please reach out to us with this Transaction_Reference: ${transactionReference}`
        )
      }

      return false
    } catch (error) {
      console.error('Error verifying transaction:', error)
      setVerifyPay(false)
      setAppContext((prev) => ({ ...prev, spinner: false }))
      {
        /* redo this later */
      }
      showAlert(
        false,
        'Payment Verification Error',
        'An error occurred while verifying the transaction. Please refresh the page.'
      )
      toast.error(
        'An error occurred while verifying the transaction. Please refresh the page.'
      )

      return false
    }
  }, [transactionReference, setAppContext, showAlert])

  // Fetch unique code
  const fetchUniqueCode = useCallback(async () => {
    try {
      const res = await getUserCodeRef.current({ transactionReference })

      if (res.data.status === 'success') {
        toast.success(res.data.message)
        setUniqueCode(res.data.data)
        if (res.data.email) {
          setFormData((prev) => ({ ...prev, email: res.data.email }))
        }
        return true
      }

      // Handle error cases
      if (
        res.data.message ===
        "You can't view this page again as you have already applied"
      ) {
        showAlert(
          false,
          'Restricted Access to this page',
          'Sorry it seems you have submitted an application in the past already.'
        )
        toast.error(res.data.message)
      } else if (res.data.message === "Could not verify user's payment") {
        showAlert(
          false,
          'Transaction record missing/Yet to be received and so cannot generate a uniqueCode for your application',
          `Sorry it seems we haven't received your payment details yet. Please give us a little time to resolve this and please don't close the page as we would try to resolve this, But if it persists for too long please reach out to us at support@grantera.org with this transaction reference: ${transactionReference}`
        )
      } else {
        toast.error(
          "couldn't get applicant's UniqueCode for application. Please try refreshing the page"
        )
      }

      return false
    } catch (error) {
      console.error('Error fetching user code:', error)
      showAlert(
        false,
        'Transaction record missing/Yet to be received and so cannot generate a uniqueCode for your application',
        `Sorry it seems we haven't received your payment details yet. Please give us a little time to resolve this and please don't close the page as we would try to resolve this, But if it persists for too long please reach out to us at support@grantera.org with this transaction reference: ${transactionReference}`
      )
      return false
    }
  }, [transactionReference, showAlert])

  // Initialize on mount
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        const paymentVerified = await verifyPayment()

        if (paymentVerified && isMounted) {
          await fetchUniqueCode()
        }
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        if (isMounted) {
          setAppContext((prev) => ({ ...prev, spinner: false }))
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - runs once on mount

  // Memoized copy handler
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(uniqueCode)
    toast.success('Copied')
  }, [uniqueCode])

  // Memoized close alert handler
  const handleCloseAlert = useCallback(() => {
    setAlertMsg((prev) => ({ ...prev, open: false }))
  }, [setAlertMsg])

  // Success screen component
  const SuccessScreen = useMemo(() => {
    if (!isSubmitted) return null

    return (
      <div
        className={`min-h-screen bg-background ${
          appContext.spinner ? 'h-screen overflow-hidden' : ''
        }`}
      >
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Card className="border-[#00994C] shadow-lg rounded-lg p-4">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#00994C]/10 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-[#00994C]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-playfair)] text-[#003366]">
                  Application Submitted Successfully!
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
                  Thank you for applying to Grantera. We've received your
                  application and will review it carefully.
                </p>

                <div className="bg-[#FFB800]/10 border-2 border-[#FFB800] rounded-lg p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Application Code
                  </p>
                  <p className="text-2xl font-bold text-[#003366] font-mono">
                    {uniqueCode}
                  </p>
                </div>

                <Alert className="text-left mb-6">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">What happens next?</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Confirmation email sent to {formData.email}</li>
                      <li>
                        • Business proposal upload link will be sent within 24
                        hours
                      </li>
                      <li>• Application review takes 2-4 weeks</li>
                      <li>• You'll be notified of the decision via email</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  asChild
                  className="bg-[#003366] hover:bg-[#00994C] text-white"
                >
                  <a href="/">Return to Homepage</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }, [isSubmitted, uniqueCode, formData.email, appContext.spinner])

  if (isSubmitted) {
    return SuccessScreen
  }

  // Main application form view
  {
    /* redo this later */
    /* if (verifyPay && uniqueCode) */
  }

  if (verifyPay && uniqueCode) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#00994C]/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[#00994C]" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-playfair)] text-[#003366]">
                  Payment Successful!
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Your commitment fee has been received. Complete your
                  application below.
                </p>
              </div>

              {/* Unique Code Display */}
              <Card className="border-[#FFB800] shadow-lg mb-1 rounded-lg">
                <CardHeader className="bg-gradient-to-r from-[#FFB800]/10 to-[#FFB800]/5 p-2">
                  <CardTitle className="text-xl font-bold text-[#003366]">
                    Your Unique Application Code
                  </CardTitle>
                  <CardDescription>
                    Save this code for tracking your application status
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 p-4">
                  <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Application Code
                      </p>
                      <p className="text-2xl font-bold text-[#003366] font-mono">
                        {uniqueCode}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="border-[#00994C] text-[#00994C] hover:bg-[#00994C] hover:text-white bg-transparent"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    This code has been sent to your email and can be used to
                    track your application.
                  </p>
                </CardContent>
              </Card>

              {/* Application Form */}
              <ApplicationSection
                uniqueCode={uniqueCode}
                rawTx_Ref={transactionReference}
              />
            </div>
          </main>
          <Footer />
        </div>
        {/* redo this later */}
        {alertMsg.open && (
          <FeedbackAlert
            isOpen={alertMsg.open}
            isClose={handleCloseAlert}
            message={{
              status: alertMsg.status,
              statusMsg: alertMsg.statusMsg,
              message: alertMsg.msg,
            }}
          />
        )}
      </>
    )
  }

  // Loading/error state
  {
    /* redo this later */
  }
  return (
    <>
      {alertMsg.open && (
        <FeedbackAlert
          isOpen={alertMsg.open}
          isClose={handleCloseAlert}
          message={{
            status: alertMsg.status,
            statusMsg: alertMsg.statusMsg,
            message: alertMsg.msg,
          }}
        />
      )}
    </>
  )
}
