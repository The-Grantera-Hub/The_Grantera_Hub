import { Calendar, Clock, TrendingUp, Award } from 'lucide-react'

const timelineSteps = [
  {
    icon: Calendar,
    title: 'Application Opens',
    description:
      'Submit your application and proposal during our open application period.',
    duration: 'Ongoing',
  },
  {
    icon: Clock,
    title: 'Review Period',
    description:
      'Our team reviews all applications and evaluates proposals for feasibility and impact.',
    duration: 'Commences February',
  },
  {
    icon: TrendingUp,
    title: 'Selection & Notification',
    description:
      'Successful applicants are notified via email and phone with next steps.',
    duration: '1 week',
  },
  {
    icon: Award,
    title: 'Grant Disbursement',
    description:
      'Approved grants are disbursed directly to recipients to fuel their business growth.',
    duration: 'March 30th',
  },
]

export function TimelineSection() {
  return (
    <section
      id="timeline"
      className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <img
          src="/upward-growth-chart--business-success-journey--asc.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/95 to-primary/90" />
      {/* </CHANGE> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-playfair)] text-balance">
            Application Timeline
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-8" />
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto text-pretty">
            From application to funding, here's what to expect on your journey
            with Grantera.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {timelineSteps.map((step, index) => (
              <div key={index} className="flex gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent text-primary flex-shrink-0">
                    <step.icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className="w-0.5 h-full bg-primary-foreground/20 mt-4 min-h-[60px]" />
                  )}
                </div>
                <div className="flex-1 -mt-[.05rem] pb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {step.title}
                    </h3>
                    <span className="text-sm md:text-base text-accent font-medium">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-primary-foreground/80 leading-relaxed text-pretty">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
