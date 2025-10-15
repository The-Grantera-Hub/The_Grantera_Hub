import { useState } from 'react'
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
import { Loader2, AlertCircle, Lock } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendEmailVerification,
} from 'firebase/auth'
import { useSpinner } from '@/components/SpinnerProvider'
import { auth } from '@/firebaseConfig'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { appContext, setAppContext, setAlertMsg, alertMsg } = useSpinner()

  //   const handleSubmit = async (e) => {
  //     e.preventDefault()
  //     setError('')
  //     setIsLoading(true)

  //     // Simulate authentication
  //     await new Promise((resolve) => setTimeout(resolve, 1500))

  //     // Simple demo authentication
  //     if (
  //       formData.email === 'admin@grantera.ng' &&
  //       formData.password === 'admin123'
  //     ) {
  //       navigate('/admin')
  //     } else {
  //       setError('Invalid email or password. Please try again.')
  //       setIsLoading(false)
  //     }
  //   }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setAppContext({ ...appContext, spinner: true })
    console.log('loginnng in...')

    const email = formData.email
    const password = formData.password
    try {
      await setPersistence(auth, browserSessionPersistence)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      navigate('/admin')
      setAppContext({ ...appContext, spinner: false })
    } catch (error) {
      setAppContext({ ...appContext, spinner: false })
      setIsLoading(false)
      setAlertMsg({
        open: true,
        status: false,
        msg: error.code,
        statusMsg: error.message,
      })
    }
  }

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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/90"
                disabled={isLoading}
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
