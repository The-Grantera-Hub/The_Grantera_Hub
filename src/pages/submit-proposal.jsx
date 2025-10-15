import ProposalSubmissionForm from '@/components/proposal-submission-form'
import { Footer } from '@/components/footer'

export default function SubmitProposal() {
  return (
    <div className="min-h-screen">
      <main>
        <ProposalSubmissionForm />
      </main>
      <Footer />
    </div>
  )
}
