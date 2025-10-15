import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import HeroSection from '@/components/sections/hero-section'
import AboutSection from '@/components/sections/about-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { SuccessStoriesSection } from '@/components/sections/success-stories-section'
import CommitmentFeeSection from '@/components/sections/commitment-fee-section'
import { TimelineSection } from '@/components/sections/timeline-section'
import ApplicationSection from '@/components/sections/application-section'
import CtaSection from '@/components/sections/cta-section'
import { useSpinner } from '@/components/SpinnerProvider'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scroller } from 'react-scroll'

export default function HomePage() {
  const { appContext } = useSpinner()

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
