import { Navbar } from '@/components/navbar'
import { HeroBanner } from '@/components/hero-banner'
import { Link } from 'react-router-dom'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <Navbar />
        <HeroBanner />

        {/* Features Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Partner With Grantera?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Help entrepreneurs access the grants they need while earning
            competitive commissions.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Competitive Commissions',
                desc: 'Earn generous commissions on every successful referral.',
                icon: '💰',
              },
              {
                title: 'Easy Sharing',
                desc: 'Get your unique referral link and start sharing immediately.',
                icon: '🔗',
              },
              {
                title: 'Real-Time Tracking',
                desc: 'Monitor referrals, applications, and earnings in real-time.',
                icon: '📊',
              },
              // {
              //   title: 'Marketing Resources',
              //   desc: 'Access professional banners and promotional materials.',
              //   icon: '🎨',
              // },
              // {
              //   title: 'Dedicated Support',
              //   desc: 'Get help from our affiliate success team.',
              //   icon: '🤝',
              // },
              {
                title: 'Global Impact',
                desc: 'Help entrepreneurs worldwide access funding.',
                icon: '🌍',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#002F6C] to-[#10b981] rounded-3xl p-8 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of affiliates earning with Grantera. Sign up takes
              less than 5 minutes.
            </p>
            <Link to="/affiliateSignUp">
              <button className="bg-[#fbbf24] text-[#002F6C] px-8 py-4 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors text-lg">
                Become an Affiliate →
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
