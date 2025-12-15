import { Link } from 'react-router-dom'

export function HeroBanner() {
  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <img
        src="/professional-affiliate-growth-chart-dashboard-with.jpg"
        alt="Grantera affiliate growth and earnings dashboard"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#002F6C]/95 via-[#002F6C]/85 to-[#10b981]/70" />

      {/* Content - Centered on top of image and gradient */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-pretty text-white">
            Your Dream Business Starts Here
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 leading-relaxed font-serif">
            Grantera empowers ambitious Nigerian entrepreneurs with business
            grants to turn their vision into reality. No loans. No equity. Just
            pure opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/payment-page">
              <button className="bg-[#fbbf24] text-[#002F6C] px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#f59e0b] transition-all duration-300 transform hover:scale-105 text-base sm:text-lg w-full sm:w-auto">
                Apply for a Grant →
              </button>
            </Link>
            <Link to="/">
              <button className="border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 text-base sm:text-lg w-full sm:w-auto">
                Learn More →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle vignette effect for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
    </div>
  )
}
