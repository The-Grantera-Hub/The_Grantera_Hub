import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSpinner } from '@/components/SpinnerProvider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Copy, Mail, Loader2 } from 'lucide-react'
import ApplicationSection from '@/components/sections/application-section'
import { connectFunctionsEmulator, httpsCallable } from 'firebase/functions'
import { functions } from '@/firebaseConfig'
import { toast } from 'sonner'
import useRetry from '@/components/web-hook-retry-hook'
import FeedbackAlert from '@/components/Alert'

export default function PaymentSuccessPage() {
  const { appContext, setAppContext, alertMsg, setAlertMsg } = useSpinner()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [WebHookFailed, setWebHookFailed] = useState(false)
  const [uniqueCode, setUniqueCode] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [wantsMentorship, setWantsMentorship] = useState(false)
  const [verifyPay, setVerifyPay] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    nin: '',
    accountNumber: '',
  })

  const { WebHookRetry } = useRetry()

  const searchParam = new URLSearchParams(window.location.search)
  const transactionReference = localStorage.getItem('transactionReference')
  const transaction_id = searchParam.get('transaction_id')
  //console.log(rawTx_Ref)
  console.log(transaction_id)

  

  useEffect(() => {
    if (!WebHookFailed) return
    const initiateRetry = async () => {
      await WebHookRetry(
        transaction_id,
        (res) => {
          // ✅ onSuccess
          setAlertMsg({
            open: true,
            status: true,
            msg: 'Payment confirmed! Refreshing your dashboard...',
            statusMsg: 'Payment Verified',
          })
        },
        (err) => {
          // ❌ onFailure
          setAlertMsg({
            open: true,
            status: false,
            msg: 'Verification failed. Please refresh your page.',
            statusMsg: 'Retry Limit Reached',
          })
        },
        (progress) => {
          // 🔁 onProgress
          switch (progress.stage) {
            case 'retrying':
              setAlertMsg({
                open: true,
                status: false,
                msg: progress.message,
                statusMsg: 'Please wait...',
              })
              break
            case 'countdown':
              setAlertMsg({
                open: true,
                status: false,
                msg: progress.message,
                statusMsg: `Next check in ${progress.nextIn}s`,
              })
              break
            case 'success':
              setAlertMsg({
                open: true,
                status: true,
                msg: progress.message,
                statusMsg: 'Payment Successful',
              })
              break
            case 'timeout':
            case 'error':
              setAlertMsg({
                open: true,
                status: false,
                msg: progress.message,
                statusMsg: 'Verification Timeout',
              })
              break
            default:
              break
          }
        }
      )
    }

    initiateRetry()
  }, [WebHookFailed]) // Add dependency

  useEffect(() => {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }, [])

  //verify Payment Status
  const VerifyPay = async () => {
    setAppContext({ ...appContext, spinner: true })
    const verifyTransactionStatus = httpsCallable(
      functions,
      'verifyTransactionStatus'
    )
    try {
      const res = await verifyTransactionStatus({
        transactionReference,
      })

      if (
        res.data?.status === 'success' &&
        res.data?.message === 'Transaction verified successfully'
      ) {
        return setVerifyPay(true)
      } else {
        setVerifyPay(false)
        if (res.data.message === 'Request timed out') {
          setAlertMsg({
            ...alertMsg,
            open: true,
            status: false,
            msg: 'Verification process took too long, please refresh the page.',
            statusMsg: 'Request Timeout',
          })
          return toast.error(
            'Verification process took too long, please refresh the page'
          )
        }
        //if the applicant did not pay the right amount
        if (
          res.data.message === "Unfortunately You didn't pay the right amount"
        ) {
          setAlertMsg({
            ...alertMsg,
            open: true,
            status: false,
            msg: "Unfortunately You didn't pay the right amount.",
            statusMsg: 'Incorrect Payment Amount',
          })
          return toast.error(`${res.data.message}`)
        }
        //if the applicant did not actually pay
        else if (res.data.message === 'No transaction was found for this id') {
          setAlertMsg({
            ...alertMsg,
            open: true,
            status: false,
            msg: 'No transaction was found for this id.',
            statusMsg: 'Missing Transaction Records',
          })
          return toast.error(`${res.data.message}: ${transactionReference}`)
        }

        setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: `Sorry an error occured, please reach out to us at support@grantera.org with this Transaction_Reference: ${transactionReference}, and try refreshing, the page to see if it can be resolved`,
          statusMsg:
            'Unfortunately an error occured while verifying your transaction.',
        })
        return toast.error(
          `Sorry an error occured, please reach out to us with this Transaction_Reference: ${transactionReference}`
        )
      }
    } catch (error) {
      setVerifyPay(false)
      console.error('Error verifying transaction:', error)
      setAppContext({ ...appContext, spinner: false })
      toast.error(
        'An error occurred while verifying the transaction. Please refresh the page.'
      )
      setAlertMsg({
        ...alertMsg,
        open: true,
        status: false,
        msg: 'An error occurred while verifying the transaction. Please refresh the page.',
        statusMsg: 'Payment Verification Error',
      })
    }
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        await VerifyPay()
      } catch (error) {
        console.error('VerifyPay failed:', error)
      }

      try {
        const getUserUniqueCode = httpsCallable(functions, 'getUserUniqueCode')
        if (verifyPay) {
          const res = await getUserUniqueCode({ transactionReference })
          if (!isMounted) return
          console.log('uq:', res)
          if (res.data.status === 'success') {
            toast.success(res.data.message)
            return setUniqueCode(res.data.data)
          } else {
            if (
              res.data.message ==
              "You can't view this page again as you have already applied"
            ) {
              setAlertMsg({
                ...alertMsg,
                open: true,
                status: false,
                msg: 'Sorry it seems you have submitted an application in the past already.',
                statusMsg: 'Restricted Access to this page',
              })
              //setDuplicateApplicantion()
              return toast.error(res.data.message)
            }
            //try webhook retry here
            if ((res.data.message = "Could not verify user's payment")) {
              setAlertMsg({
                ...alertMsg,
                open: true,
                status: false,
                msg: `Sorry it seems we haven't received your payment details yet. Please give us a little time to resolve this and please don't close the page as we would try to resolve this, But if it persists for too long please reach out to us at support@grantera.org with this transaction reference: ${transactionReference}`,
                statusMsg:
                  'Transaction record missing/Yet to be received and so cannot generate a uniqueCode for your application',
              })
            }
            toast.error(
              "couldn't get applicant's UniqueCode for application. Please try refreshing the page"
            )
            //webHook retry logic
            //setWebHookFailed(true)
          }
        }
      } catch (error) {
        console.error('Error fetching user code:', error)
        setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: `Sorry it seems we haven't received your payment details yet. Please give us a little time to resolve this and please don't close the page as we would try to resolve this, But if it persists for too long please reach out to us at support@grantera.org with this transaction reference: ${transactionReference}`,
          statusMsg:
            'Transaction record missing/Yet to be received and so cannot generate a uniqueCode for your application',
        })
        //webHook retry logic
        //setWebHookFailed(true)
      } finally {
        if (isMounted) {
          setAppContext((prev) => ({ ...prev, spinner: false }))
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [transactionReference, verifyPay])

  /* const uniqueCode =
    'GRA-2025-' + Math.random().toString(36).substring(2, 8).toUpperCase() */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(uniqueCode)
    toast.success('Copied')
  }

  if (isSubmitted) {
    return (
      <div
        className={`min-h-screen bg-background  ${
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
  }

  //add a button so they can click and proceed to submitting their proposals
  return (
    <>
      {verifyPay && uniqueCode ? (
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
      ) : (
        ''
      )}
      {alertMsg.open && (
        <FeedbackAlert
          isOpen={alertMsg.open}
          isClose={() =>
            setAlertMsg((prev) => ({ ...prev, open: !alertMsg.open }))
          }
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
