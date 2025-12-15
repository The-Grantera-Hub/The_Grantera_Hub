import { Navbar } from '@/components/navbar'
import { SignupForm } from '@/components/signup-form'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <SignupForm />
    </main>
  )
}
