import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDashboard = location.pathname?.startsWith('/affiliateDash')

  const SignOut = useCallback(() => {
    signOut(auth).then(() => {
      navigate('/affiliateLogin')
    })
  }, [navigate])

  if (isDashboard) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">
          <Link
            to="/affiliate"
            className="flex items-center gap-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex justify-center items-center">
              <img
                src="/logo.svg"
                alt="grantera logo"
                className="w-16 h-16 -mb-4"
              />
              <div className="text-2xl md:text-3xl font-bold text-primary font-[family-name:var(--font-playfair)]">
                Grantera
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <span className="text-sm text-gray-600 max-sm:hidden">
              Welcome back, Affiliate
            </span>
            <button
              onClick={SignOut}
              className="text-gray-600 hover:text-[#002F6C] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/affiliate"
            className="flex items-center gap-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex justify-center items-center">
              <img
                src="/logo.svg"
                alt="grantera logo"
                className="w-16 h-16 -mb-4"
              />
              <div className="text-2xl md:text-3xl font-bold text-primary font-[family-name:var(--font-playfair)]">
                Grantera
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/affiliatelogin"
              className="text-gray-600 hover:text-[#002F6C] transition-colors"
            >
              Login
            </Link>
            <Link to="/affiliateSignUp">
              <button className="bg-[#fbbf24] text-[#002F6C] px-6 py-2 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 mt-4 pt-4 space-y-4">
            <Link
              to="/affiliateLogin"
              className="block text-gray-600 hover:text-[#002F6C]"
            >
              Login
            </Link>
            <Link to="/affiliateSignUp" className="block">
              <button className="w-full bg-[#fbbf24] text-[#002F6C] px-6 py-2 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
