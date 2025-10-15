import { Link } from 'react-router-dom'
import { Facebook, Mail, Building2, Phone, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              {/* Logo */}
              <img src="/logo.svg" alt="grantera logo" className="w-20 h-20" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-[family-name:var(--font-playfair)]">
                Grantera
              </h3>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed max-w-md">
              Empowering Nigerian entrepreneurs and small businesses with grants
              to turn their dreams into reality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="#about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="#how-it-works"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="#timeline"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Timeline
                </Link>
              </li>
              <li>
                <Link
                  to="#apply"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex gap-2">
                <Building2 className="w-5 h-5" />
                <span className="-mt-[.2rem]">Lagos, Nigeria</span>
              </li>
              <li className="flex gap-2">
                <a
                  href="mailto:support@gmail.com"
                  className="flex gap-2 items-center"
                >
                  <Mail className="w-5 h-5" />
                  <span className="-mt-[.2rem]">support@grantera.org</span>
                </a>
              </li>
              <li className="flex gap-2">
                <a href="tel:09022739243" className="flex gap-2 items-center">
                  <Phone className="w-5 h-5" />
                  <span className="-mt-[.2rem]">+234-902-2739-243</span>
                </a>
              </li>
              <li className="flex gap-2">
                <a
                  href="https://www.facebook.com/share/1B8Ggv84be/?mibextid=wwXIfr"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex gap-2 items-center"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="-mt-[.2rem]"> FaceBook</span>
                </a>
              </li>
              <li className="flex gap-2">
                <a
                  href="https://www.tiktok.com/@the.grantera.hub?_t=ZS-8zwGTjBwL9I&_r=1"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex gap-2 items-center"
                >
                  <img src="/tiktok.svg" className="w-6 h-6" />
                  <span className="-mt-[.2rem]">TikTok</span>
                </a>
              </li>
              <li className="flex gap-2">
                <a
                  href="https://www.instagram.com/the_grantera_hub?igsh=amxwbnkwbXZ6ajc0&utm_source=qr"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex gap-2 items-center"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="-mt-[.2rem]">IG</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} Grantera. All rights reserved.
            Empowering the Nigerian dream.
          </p>
        </div>
      </div>
    </footer>
  )
}
