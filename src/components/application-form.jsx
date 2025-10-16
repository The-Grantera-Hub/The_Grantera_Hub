import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { setDoc, doc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  Loader2,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { buildApplicantEmail, sendEmail } from '@/components/utils/Sample'
import { Link } from 'react-router-dom'

export default function ApplicationForm({ uniqueCode, rawTx_Ref }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wantsMentorship, setWantsMentorship] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    location: '',
    grantAmount: '',
    businessDescription: '',
    grantPurpose: '',
  })

  // Memoized input change handler to prevent recreation on every render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Memoized navigation handlers
  const handleNext = useCallback(() => setStep((prev) => Math.min(prev + 1, 2)), [])
  const handleBack = useCallback(() => setStep((prev) => Math.max(prev - 1, 1)), [])
  const toggleMentorship = useCallback(() => setWantsMentorship((prev) => !prev), [])

  // Memoized email sending function
  const handleSend = useCallback(async () => {
    const applicant = {
      email: formData.email,
      fullName: formData.fullName,
      uniqueCode,
      businessName: formData.businessName,
      grantAmount: formData.grantAmount,
      wantsMentorship,
    }
    try {
      const html = buildApplicantEmail(applicant)
      const result = await sendEmail(
        applicant.email,
        'Grantera Application Received ✅',
        html,
        "We've received your application!"
      )
      console.log('Email sent successfully', result)
    } catch (err) {
      console.error('Email sending failed:', err)
    }
  }, [formData.email, formData.fullName, formData.businessName, formData.grantAmount, uniqueCode, wantsMentorship])

  // Memoized form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await setDoc(doc(db, 'applicants', uniqueCode), {
        tx_ref: rawTx_Ref,
        fullName: formData.fullName,
        uniqueCode,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location,
        grantAmount: formData.grantAmount,
        businessDescription: formData.businessDescription,
        grantPurpose: formData.grantPurpose,
        wantsMentorship,
        status: 'pending',
        lastStatusUpdatedBy: 'System',
        aiStatus: 'idle',
        createdAt: new Date(),
      })
      
      setIsSubmitted(true)
      await handleSend()
    } catch (error) {
      if (error.message === 'Missing or insufficient permissions.') {
        toast.error(
          "It seems you might have applied in the past, and so can't update your details again, sorry."
        )
      } else {
        toast.error(
          'An error occurred while uploading your details, please refresh the page to try resolving this.'
        )
        console.error('Submission error:', error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, uniqueCode, rawTx_Ref, wantsMentorship, handleSend])

  // Memoized validation states
  const isStep1Valid = useMemo(() => 
    formData.fullName && formData.email && formData.phone && formData.location,
    [formData.fullName, formData.email, formData.phone, formData.location]
  )

  const isStep2Valid = useMemo(() => 
    formData.businessName && 
    formData.businessType && 
    formData.grantAmount && 
    formData.businessDescription && 
    formData.grantPurpose,
    [formData.businessName, formData.businessType, formData.grantAmount, formData.businessDescription, formData.grantPurpose]
  )

  // Success screen component (memoized to prevent rerenders)
  const SuccessScreen = useMemo(() => {
    if (!isSubmitted) return null
    
    return (
      <Card className="border-[#00994C] rounded-lg">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#00994C]/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#00994C]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">
            Application Submitted Successfully!
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
            Thank you for applying to Grantera. We've received your application
            and will review it carefully. You'll hear from us within 2-4 weeks.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation email has been sent to{' '}
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>
          </p>
          <Link to="/submit-proposal">
            <Button className="bg-[#00994C] text-white hover:bg-[#007a36]">
              Proceed to Proposal Submission
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }, [isSubmitted, formData.email])

  if (isSubmitted) {
    return SuccessScreen
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-4 rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Grant Application</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {step} of 2
            </span>
          </div>
          <CardDescription>
            {step === 1 ? 'Tell us about yourself' : 'Tell us about your business'}
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-[#00994C]' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (City, State) *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Lagos, Lagos State"
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type/Industry *</Label>
                <Input
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  placeholder="e.g., E-commerce, Agriculture, Technology"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grantAmount">
                  Grant Amount Requested (₦) *
                </Label>
                <Input
                  id="grantAmount"
                  name="grantAmount"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={formData.grantAmount}
                  onChange={handleInputChange}
                  placeholder="500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessDescription">
                  Business Description *
                </Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  placeholder="Briefly describe what your business does..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grantPurpose">
                  How will you use the grant? *
                </Label>
                <Textarea
                  id="grantPurpose"
                  name="grantPurpose"
                  value={formData.grantPurpose}
                  onChange={handleInputChange}
                  placeholder="Explain how the grant will help grow your business..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="bg-[#00994C]/5 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="mentorship"
                      className="text-base font-semibold text-[#003366] cursor-pointer"
                    >
                      Would you like to receive mentorship?
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get guidance from experienced entrepreneurs and business
                      experts
                    </p>
                  </div>
                  <button
                    type="button"
                    id="mentorship"
                    onClick={toggleMentorship}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      wantsMentorship ? 'bg-[#00994C]' : 'bg-muted'
                    }`}
                    aria-label="Toggle mentorship"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        wantsMentorship ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {wantsMentorship && (
                  <Badge className="bg-[#FFB800] text-[#003366] hover:bg-[#FFB800]/90 p-2">
                    Mentorship program included
                  </Badge>
                )}
              </div>
              
              <Alert className="border-[#FFB800]/30 bg-[#FFB800]/5">
                <Mail className="h-4 w-4 text-[#FFB800]" />
                <AlertDescription className="ml-6">
                  <p className="font-semibold text-[#003366] -mt-5 mb-2">
                    Next Steps:
                  </p>
                  <p className="text-sm text-foreground/80">
                    Please make sure to store your unique code properly as this
                    would enable you to submit your business proposal
                    successfully. Your business proposal upload link and
                    submission timeline will be sent to your email within 24
                    hours. Please check your inbox (and spam folder) regularly.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-secondary text-white"
                disabled={!isStep1Valid}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isStep2Valid}
                className="flex-1 bg-primary hover:bg-secondary text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}