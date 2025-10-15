import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollToSectionLink from '@/components/ScrollToSectionLink' // ✅ New import

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border cursor-pointer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ✅ Use normal Link for logo navigation */}
          <Link
            to="/"
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

          {/* ✅ Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ScrollToSectionLink
              to="about"
              className="text-sm font-medium hover:text-secondary transition-colors"
            >
              About Us
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="how-it-works"
              className="text-sm font-medium hover:text-secondary transition-colors"
            >
              How It Works
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="timeline"
              className="text-sm font-medium hover:text-secondary transition-colors"
            >
              Timeline
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="cta"
              className="text-sm font-medium hover:text-secondary transition-colors"
            >
              Apply Now
            </ScrollToSectionLink>
          </div>

          {/* ✅ Desktop Button */}
          <div className="hidden md:block">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-green-700 text-white"
            >
              <ScrollToSectionLink
                to="cta"
                className="text-sm font-medium hover:text-secondary transition-colors p-4"
              >
                Get Started
              </ScrollToSectionLink>
            </Button>
          </div>

          {/* ✅ Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* ✅ Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <ScrollToSectionLink
              to="about"
              className="block py-2 text-sm font-medium hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="how-it-works"
              className="block py-2 text-sm font-medium hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="timeline"
              className="block py-2 text-sm font-medium hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Timeline
            </ScrollToSectionLink>

            <ScrollToSectionLink
              to="cta"
              className="block py-2 text-sm font-medium hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply Now
            </ScrollToSectionLink>

            <Button
              asChild
              size="lg"
              className="w-full bg-primary hover:bg-green-700 text-white h-12"
            >
              <ScrollToSectionLink
                to="cta"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </ScrollToSectionLink>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
