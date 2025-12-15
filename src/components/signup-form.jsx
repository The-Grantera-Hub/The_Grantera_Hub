import { useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { useSpinner } from '@/components/SpinnerProvider'
import { Timestamp } from 'firebase/firestore'

import { doc, setDoc } from 'firebase/firestore'
import { auth, db, functions } from '@/firebaseConfig'
import { toast } from 'sonner'
import { httpsCallable } from 'firebase/functions'
import { Label } from '@radix-ui/react-context-menu'
import { Input } from './ui/input'

export function SignupForm() {
  const navigate = useNavigate()
  const { appContext, setAppContext, setAlertMsg } = useSpinner()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bank: '',
    accountNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [refCode, setRefCode] = useState(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const getRefCode = useRef(null)

  if (!getRefCode.current) {
    getRefCode.current = httpsCallable(functions, 'getUserUniqueCode')
  }

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const sandleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.bank ||
      !formData.accountNumber
    ) {
      setError('All fields are required')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Store data (in production, this would go to a database)
    if (typeof window !== 'undefined') {
      const referralCode =
        'GT' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const affiliateData = {
        ...formData,
        referralCode,
        referralLink: `https://grantera.com?ref=${referralCode}`,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem('granteraAffiliate', JSON.stringify(affiliateData))
      setSuccess(true)
      setIsLoading(false)

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/affiliateDash'
      }, 2000)
    }
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.bank ||
        !formData.accountNumber
      ) {
        setError('All fields are required')
        toast.error('All fields are required')
        setIsLoading(false)
        setAppContext((prev) => ({ ...prev, spinner: false }))
        return
      }
      setError('')
      setIsLoading(true)
      setAppContext((prev) => ({ ...prev, spinner: true }))

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        setAlertMsg({
          open: true,
          status: false,
          msg: 'Passwords do not match.',
          statusMsg: 'Signup Failed',
        })
        setIsLoading(false)
        setAppContext((prev) => ({ ...prev, spinner: false }))
        return
      }

      try {
        //get referral code from cloud function
        const reffCode = await getRefCode.current({ affiliate: true })
        const code = reffCode?.data?.data

        if (reffCode.data.status === 'success') {
          setRefCode((prev) => {
            prev = code
            return prev
          })
          toast.success(reffCode.data.message)
        }
        if (reffCode.data.status === 'error') {
          toast.error(reffCode.data.message)
          setIsLoading(false)
          setAppContext((prev) => ({ ...prev, spinner: false }))
          throw new Error(reffCode.data.message)
        }

        // session persistence
        await setPersistence(auth, browserSessionPersistence)

        // create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )

        const user = userCredential.user

        // Save extra user data in Firestore
        await setDoc(doc(db, 'affiliates', user.uid), {
          uid: user.uid,
          role: 'affiliate',
          fullName: formData.fullName,
          email: formData.email,
          bank: formData.bank,
          accountNumber: formData.accountNumber,
          referralCode: code,
          referralLink: `https://grantera.org/${code}/${formData.fullName}/${user.uid}`,
          phoneNumber: formData.phone,
          createdAt: new Date(),
          totalInvited: 0,
          // lastReffered: null,
          approved: 0,
          pending: 0,
          affiliateActivity: false,
          rejected: 0,
        })
        /* check out this affiliatesSummary logic later bruh */
        await setDoc(doc(db, 'affiliatesSummary', user.uid), {
          affiliateUid: user.uid,
          name: formData.fullName,
          email: formData.email,
          referralCode: code,
          lastReffered: null,
          referralLink: `https://grantera.org/${code}/${formData.fullName}/${user.uid}`,
          createdAt: Timestamp.fromDate(new Date()),
          totalInvited: 0,
          approved: 0,
        })

        // )
        setSuccess(true)
        setIsLoading(false)
        setAppContext((prev) => ({ ...prev, spinner: false }))

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/affiliateDash'
        }, 2000)
        //if (typeof window !== 'undefined') {
        // const referralCode =
        //   'GT' + Math.random().toString(36).substr(2, 9).toUpperCase()
        // const affiliateData = {
        //   ...formData,
        //   referralCode,
        //   referralLink: `https://grantera.com?ref=${referralCode}`,
        //   createdAt: new Date().toISOString(),
        // }

        // localStorage.setItem(
        //   'granteraAffiliate',
        //   JSON.stringify(affiliateData)
        // )
        // setSuccess(true)
        // setIsLoading(false)
        // setAppContext((prev) => ({ ...prev, spinner: false }))

        // // Redirect after 2 seconds
        // setTimeout(() => {
        //   window.location.href = '/affiliateDash'
        // }, 2000)
        //}
      } catch (error) {
        console.error('Signup error:', error)

        const errorMessages = {
          'auth/email-already-in-use':
            'This email is already registered. Try logging in instead.',
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/weak-password':
            'Your password is too weak. Use at least 6 characters.',
          'auth/network-request-failed':
            'Network error. Please check your internet connection.',
        }

        const friendlyMessage = errorMessages[error.code] || error.message

        setError(friendlyMessage)
        setAlertMsg({
          open: true,
          status: false,
          msg: friendlyMessage,
          statusMsg: 'Signup Failed',
        })
      } finally {
        setIsLoading(false)
        setAppContext((prev) => ({ ...prev, spinner: false }))
      }
    },
    [
      formData.fullName,
      formData.email,
      formData.phone,
      formData.password,
      formData.confirmPassword,
      navigate,
      refCode,
      setAppContext,
      setAlertMsg,
    ]
  )

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Created!
          </h2>
          <p className="text-gray-600 mb-2">
            Your unique referral code has been generated.
          </p>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600 mb-8">
          Join the Grantera affiliate program today
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle
              size={20}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Bank
            </label>
            <input
              type="text"
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="Access Bank"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Account Number
            </label>
            <input
              type="number"
              name="accountNumber"
              value={formData.accountNumber}
              onWheel={(e) => e.target.blur()}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="1578964320"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#002F6C] to-[#10b981] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-70 mt-6"
          >
            {isLoading ? 'Creating Account...' : 'Create Affiliate Account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{' '}
          <Link
            to="/affiliateLogin"
            className="text-[#002F6C] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Tip:</span> Your unique referral
            code and link will be generated automatically after signup.
          </p>
        </div>
      </div>
    </div>
  )
}
