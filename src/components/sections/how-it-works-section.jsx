import { FileText, Upload, Search, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Submit Your Application',
    description:
      'Fill out our simple application form with your business details, vision, and how the grant will help you grow.',
  },
  {
    icon: Upload,
    title: 'Upload Your Proposal',
    description:
      'Share your detailed business proposal (PDF or Docx format) outlining your plans, goals, and expected impact.',
  },
  {
    icon: Search,
    title: 'Review Process',
    description:
      'Our team carefully reviews each application, evaluating feasibility, impact potential, and alignment with our mission.',
  },
  {
    icon: CheckCircle,
    title: 'Receive Your Grant',
    description:
      'Successful applicants receive their grant funding and join our community of empowered entrepreneurs.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-playfair)] text-balance">
            How It Works
          </h2>
          <div className="w-24 h-1 bg-[#FFB800] mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Getting your business grant is simple. Follow these four steps to
            start your journey with Grantera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border border-border h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00994C]/10 mb-6">
                  <step.icon className="w-8 h-8 text-[#00994C]" />
                </div>
                <div className="absolute top-8 -left-4 w-8 h-8 rounded-full bg-[#FFB800] text-[#003366] font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-balance">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
