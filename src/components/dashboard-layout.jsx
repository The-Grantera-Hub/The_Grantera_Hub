import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from './navbar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebaseConfig'


export function DashboardLayout({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/affiliate')
      }
    })
    /* if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('granteraLoggedIn')
      if (!isLoggedIn) {
        navigate('/affiliate')
      }
    } */
  }, [navigate])

  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
        {children}
      </div>
    </main>
  )
}
