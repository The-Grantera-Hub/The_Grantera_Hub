import ApplicationForm from '@/components/application-form'
import { FileText } from 'lucide-react'

export default function ApplicationSection({ uniqueCode, rawTx_Ref }) {
  return (
    <section id="apply" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Start Your Journey</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Apply for a Grant
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Complete the application form below to take the first step toward
            transforming your business dreams into reality.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <ApplicationForm uniqueCode={uniqueCode} rawTx_Ref={rawTx_Ref} />
        </div>
      </div>
    </section>
  )
}
