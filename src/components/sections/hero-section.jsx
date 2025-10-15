import { ArrowRight } from 'lucide-react'
import { Link as ScrollLink } from 'react-scroll'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/nigerian-entrepreneur-working-on-laptop-in-modern-.jpg"
          alt="Nigerian entrepreneur"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#003366]/95 to-[#00994C]/80" />
      </div>

      {/* Content */}
      <div
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-[family-name:var(--font-playfair)] leading-tight text-balance">
            Your Dream Business Starts Here
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto text-pretty">
            Grantera empowers ambitious Nigerian entrepreneurs with business
            grants to turn their vision into reality. No loans. No equity. Just
            pure opportunity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 cursor-pointer">
            <ScrollLink
              to="cta"
              smooth={true}
              duration={500}
              offset={-80}
              className="bg-[#FFB800] text-[#003366] hover:bg-[#FFB800]/90 font-semibold text-base md:text-lg px-8 py-6 rounded-md inline-flex items-center"
            >
              Apply for a Grant <ArrowRight className="ml-2 h-5 w-5" />
            </ScrollLink>
            <ScrollLink
              to="how-it-works"
              smooth={true}
              duration={500}
              offset={-80}
              className="bg-white/10 text-white border border-white/30 hover:bg-white/20 text-base md:text-lg px-8 py-6 rounded-md inline-flex items-center"
            >
              Learn More <ArrowRight className="ml-2 h-5 w-5" />
            </ScrollLink>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
