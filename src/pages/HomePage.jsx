import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import HeroSection from '@/components/sections/hero-section'
import AboutSection from '@/components/sections/about-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { SuccessStoriesSection } from '@/components/sections/success-stories-section'
import CommitmentFeeSection from '@/components/sections/commitment-fee-section'
import { TimelineSection } from '@/components/sections/timeline-section'
import CtaSection from '@/components/sections/cta-section'
import { useSpinner } from '@/components/SpinnerProvider'
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { scroller } from 'react-scroll'

export default function HomePage() {
  const { appContext } = useSpinner()
  const { referredBy, affiliateName, affiliateUid } = useParams()

  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const section = location.hash.replace('#', '')
      scroller.scrollTo(section, {
        smooth: true,
        duration: 500,
        offset: -80,
      })
    }
  }, [location])

  useEffect(() => {
    if (referredBy) {
      localStorage.setItem('referralCode', referredBy)
      localStorage.setItem('affiliateName', affiliateName)
      localStorage.setItem('affiliateUid', affiliateUid)
    }
  }, [referredBy])

  return (
    <div
      className={`min-h-screen ${
        appContext.spinner ? 'h-screen overflow-hidden' : ''
      }`}
    >
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <SuccessStoriesSection />
        <CommitmentFeeSection />
        {/*   <ApplicationSection /> */}
        <TimelineSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
