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
import AffDashboardPage from '@/pages/affiliates/AffiliateDash'
import LoginPage from '@/pages/affiliates/login'
import SignupPage from '@/pages/affiliates/signUp'
import Home from '@/pages/affiliates/Affiliates'

function App() {
  return (
    <SpinnerProvider>
      <TooltipProvider>
        <Sonner />
        <Routes>
          <Route path="/:referredBy?/:affiliateName?/:affiliateUid?" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/affiliateDash" element={<AffDashboardPage />} />
          <Route path="/affiliateLogin" element={<LoginPage />} />
          <Route path="/affiliateSignUp" element={<SignupPage />} />
          <Route path="/affiliate" element={<Home />} />
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
