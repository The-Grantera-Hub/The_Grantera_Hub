import { Navbar } from '@/components/navbar'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <LoginForm />
    </main>
  )
}
