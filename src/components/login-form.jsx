import { useState, useCallback } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import { useSpinner } from '@/components/SpinnerProvider'
import { Label } from '@radix-ui/react-context-menu'
import { Input } from './ui/input'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])
  const navigate = useNavigate()
  const { setAppContext, setAlertMsg } = useSpinner()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  //New Handle Submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setIsLoading(true)
      setAppContext((prev) => ({ ...prev, spinner: true }))

      try {
        await setPersistence(auth, browserSessionPersistence)
        await signInWithEmailAndPassword(auth, email, password)

        // Navigate on success
        navigate('/affiliateDash')
      } catch (error) {
        console.error('Login error:', error)

        // User-friendly error messages
        const errorMessages = {
          'auth/invalid-credential':
            'Invalid email or password. Please try again.',
          'auth/user-not-found': 'No account found with this email.',
          'auth/wrong-password': 'Incorrect password. Please try again.',
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/user-disabled': 'This account has been disabled.',
          'auth/too-many-requests':
            'Too many failed attempts. Please try again later.',
          'auth/network-request-failed':
            'Network error. Please check your connection.',
        }

        const friendlyMessage = errorMessages[error.code] || error.message

        setError(friendlyMessage)
        setAlertMsg({
          open: true,
          status: false,
          msg: friendlyMessage,
          statusMsg: 'Login Failed',
        })
      } finally {
        setIsLoading(false)
        setAppContext((prev) => ({ ...prev, spinner: false }))
      }
    },
    [email, password, navigate, setAppContext, setAlertMsg]
  )

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Affiliate Login
        </h2>
        <p className="text-gray-600 mb-8">
          Access your dashboard and manage referrals
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F6C] focus:border-transparent"
              placeholder="john@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Don't have an account?{' '}
          <Link
            to="/affiliateSignup"
            className="text-[#002F6C] font-semibold hover:underline"
          >
            Sign Up Here
          </Link>
        </p>
      </div>
    </div>
  )
}
