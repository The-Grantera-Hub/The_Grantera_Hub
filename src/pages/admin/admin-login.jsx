import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { useSpinner } from '@/components/SpinnerProvider'
import { auth } from '@/firebaseConfig'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { appContext, setAppContext, setAlertMsg } = useSpinner()

  // Memoized email change handler
  const handleEmailChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }))
  }, [])

  // Memoized password change handler
  const handlePasswordChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }))
  }, [])

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  // Memoized form validation
  const isFormValid = useMemo(
    () => formData.email && formData.password,
    [formData.email, formData.password]
  )

  // Memoized submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      setIsLoading(true)
      setAppContext((prev) => ({ ...prev, spinner: true }))

      try {
        await setPersistence(auth, browserSessionPersistence)
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )

        // Navigate on success
        navigate('/admin')
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
    [formData.email, formData.password, navigate, setAppContext, setAlertMsg]
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Grantera Admin
          </h1>
          <p className="text-white/80">Sign in to access the dashboard</p>
        </div>

        <Card className="p-4 rounded-lg">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@grantera.ng"
                  value={formData.email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handlePasswordChange}
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
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Demo credentials:</p>
                <p className="font-mono text-xs mt-1">
                  admin@grantera.ng / admin123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-white/80 hover:text-white underline"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
