import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AdminLoginPage from '@/pages/admin/admin-login'
import AdminDashboard from '@/pages/admin/admin-dashboard'
import PaymentSuccessPage from '@/pages/payment/payment-success'
import PaymentPage from '@/pages/payment/payment'
import SubmitProposal from '@/pages/submit-proposal'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import SpinnerProvider from '@/Components/SpinnerProvider'
import GranteraEmailSystem from '@/Components/utils/Sample'

function App() {
  return (
    <SpinnerProvider>
      <TooltipProvider>
        <Sonner />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment-page" element={<PaymentPage />} />
          <Route
            path="/payment-page/success"
            element={<PaymentSuccessPage />}
          />
          <Route path="/submit-proposal" element={<SubmitProposal />} />
          <Route path="/email" element={<GranteraEmailSystem />} />
        </Routes>
      </TooltipProvider>
    </SpinnerProvider>
  )
}

export default App
