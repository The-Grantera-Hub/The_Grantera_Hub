import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Shield, ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { useSpinner } from '@/components/SpinnerProvider'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebaseConfig'

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  })
  const { appContext, setAppContext } = useSpinner()
  const [callBackUrl, setCallBackUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Ref for payment redirect function
  const paymentRedirectRef = useRef(null)

  // Initialize cloud function once
  if (!paymentRedirectRef.current) {
    paymentRedirectRef.current = httpsCallable(functions, 'paymentRedirect')
  }

  // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Memoized form validation
  const isFormValid = useMemo(
    () => formData.fullName && formData.email && formData.phoneNumber,
    [formData.fullName, formData.email, formData.phoneNumber]
  )

  // Redirect effect
  useEffect(() => {
    if (callBackUrl) {
      window.location.href = callBackUrl
    }
  }, [callBackUrl])

  // Memoized payment handler
  const handlePayment = useCallback(
    async (e) => {
      e.preventDefault()

      // Validate form
      if (!isFormValid) {
        toast.error('Please fill in all required fields')
        return
      }

      try {
        setAppContext((prev) => ({ ...prev, spinner: true }))
        setIsProcessing(true)
        toast.message('You will soon be redirected to the payment gateway')

        const res = await paymentRedirectRef.current({
          email: formData.email,
        })

        if (res.data?.status === 'success') {
          toast.success('You are being redirected to the payment gateway')
          localStorage.setItem(
            'transactionReference',
            res.data.transactionReference
          )
          setCallBackUrl(res.data.data.link)
        } else {
          console.error('Payment error:', res)
          toast.warning('Sorry, an error occurred')
          setIsProcessing(false)
        }
      } catch (err) {
        console.error('Payment error:', err)
        toast.error('Error occurred while redirecting')
        setIsProcessing(false)
      } finally {
        setAppContext((prev) => ({ ...prev, spinner: false }))
      }
    },
    [isFormValid, formData.email, setAppContext]
  )

  // Memoized benefits list
  const benefits = useMemo(
    () => [
      'Professional review of your business proposal by our expert panel',
      'Administrative costs for processing and evaluating applications',
      'Ensures commitment from serious entrepreneurs only',
      'Access to exclusive mentorship opportunities (optional)',
    ],
    []
  )

  // Memoized important notes
  const importantNotes = useMemo(
    () => [
      'This fee is non-refundable and confirms your application submission',
      'Payment confirmation will be sent to your email immediately',
      "You'll receive your unique application code after payment",
      'Keep your payment receipt for your records',
    ],
    []
  )

  return (
    <div
      className={`min-h-screen bg-background ${
        appContext.spinner ? 'h-screen overflow-hidden' : ''
      }`}
    >
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-playfair)] text-[#003366]">
              Complete Your Application
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              You're one step away from accessing the Grantera Grant application
              form
            </p>
          </div>

          {/* Payment Card */}
          <Card className="border-[#003366] shadow-lg rounded-lg">
            <CardHeader className="px-2 rounded-t-lg bg-gradient-to-br from-[#003366] to-[#00994C] text-white">
              <CardTitle className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
                Commitment Fee Required
              </CardTitle>
              <CardDescription className="text-white/90 text-base">
                A one-time payment to confirm your serious interest
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-8 space-y-6">
              {/* Explanation */}
              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  A one-time{' '}
                  <span className="font-bold text-[#003366]">
                    ₦5,000 commitment fee
                  </span>{' '}
                  is required to confirm your interest in the Grantera Grant.
                  This helps ensure that only serious applicants are considered
                  and supports our transparent review process.
                </p>

                {/* Benefits */}
                <div className="bg-[#00994C]/5 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-[#003366] flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#00994C]" />
                    What This Fee Covers:
                  </h3>
                  <ul className="space-y-2 ml-7 text-sm text-foreground/80">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#FFB800] mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Payment Amount Display */}
              <div className="bg-gradient-to-r from-[#FFB800]/10 to-[#FFB800]/5 border-2 border-[#FFB800] rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Amount
                </p>
                <p className="text-5xl font-bold text-[#003366] font-[family-name:var(--font-playfair)]">
                  ₦5,000
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  One-time commitment fee
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handlePayment}>
                <Card className="p-4 rounded-lg">
                  <CardHeader>
                    <CardTitle>Your payment details</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="090-xxxx-xxx"
                          required
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Button */}
                <div className="space-y-4 mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#003366] hover:bg-[#00994C] text-white text-lg py-6"
                    disabled={isProcessing || !isFormValid}
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                    {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>

                  <Alert className="border-[#00994C]/30 bg-[#00994C]/5 flex justify-center gap-1">
                    <Shield className="h-4 w-4 text-[#00994C]" />
                    <AlertDescription className="text-sm -mt-[.2rem]">
                      <span className="font-semibold text-[#003366]">
                        Secure Payment:
                      </span>{' '}
                      You'll be redirected to Monnify's secure payment page.
                      After payment, you'll be automatically returned to
                      continue your application.
                    </AlertDescription>
                  </Alert>
                </div>
              </form>

              {/* Additional Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm ml-5">
                  <p className="font-semibold -mt-[1.2rem] mb-1">
                    Important Notes:
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {importantNotes.map((note, index) => (
                      <li key={index}>• {note}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Button
              asChild
              variant="ghost"
              className="text-muted-foreground hover:text-[#003366]"
            >
              <Link to="/">← Back to Homepage</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
