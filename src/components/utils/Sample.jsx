'use client'

import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

// --- 🔹 Utility: Simulate adding document (replace this with Firestore addDoc) ---
const simulateAddToDatabase = async (collection, data) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (Math.random() > 0.1) {
    return { id: `doc_${Date.now()}`, success: true }
  } else {
    throw new Error('Simulated failure (Network issue)')
  }
}

// --- 🔹 Core email sender ---
export const sendEmail = async (recipient, subject, html, text = '') => {
  if (!recipient || !subject || !html) {
    throw new Error('Missing required email fields')
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipient)) throw new Error('Invalid email address')

  const emailData = {
    from: 'The Grantera Hub <support@grantera.org>',
    to: recipient,
    message: { subject, html, text },
  }

  // Simulate Firestore 'mail' collection
  const docRef = await addDoc(collection(db, 'mail'), emailData) //await simulateAddToDatabase('mail', emailData)
  //return { success: true, id: docRef.id }
}

// --- 🔹 Dynamic email template generator ---
export const buildApplicantEmail = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background-color: #f5f5f5; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 40px auto; 
      background: #fff; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #003366, #00994C); 
      padding: 40px 30px; 
      text-align: center; 
      color: #fff; 
    }
    .logo-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .logo-title img {
    margin-top: 1rem;
      width: 65px;
      height: 65px;
      border-radius: 50%;
      object-fit: contain;
      
      padding: 4px;
    }
    .logo-title h1 {
      font-size: 32px;
      margin: 0;
      color: #fff;
    }
    .content { 
      padding: 40px 30px; 
      color: #333; 
    }
    .greeting { 
      font-size: 24px; 
      color: #003366; 
      margin-bottom: 20px; 
    }
    .code-box { 
      background: #f8f9fa; 
      border-left: 4px solid #00994C; 
      padding: 20px; 
      margin: 30px 0; 
      border-radius: 8px; 
    }
    .code { 
      font-size: 28px; 
      font-weight: bold; 
      color: #00994C; 
      letter-spacing: 2px; 
      margin: 10px 0; 
    }
    .highlight { 
      background: #FFB800; 
      color: #003366; 
      padding: 12px 24px; 
      border-radius: 6px; 
      display: inline-block; 
      margin: 20px 0; 
      font-weight: 600; 
    }
    .button { 
      background: #00994C; 
      color: #fff !important; 
      padding: 14px 32px; 
      border-radius: 8px; 
      text-decoration: none; 
      display: inline-block; 
      margin: 20px 0; 
      font-weight: 600; 
    }
    .footer { 
      background: #f8f9fa; 
      padding: 30px; 
      text-align: center; 
      color: #666; 
      font-size: 14px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-title">
        <img src="https://firebasestorage.googleapis.com/v0/b/the-grantera-hub-ecac0.firebasestorage.app/o/logo.svg?alt=media&token=46065c38-0916-454e-b212-a4c303e7d9da" alt="Grantera Logo" />
        <h1>Grantera</h1>
      </div>
      <p style="color: #FFB800; margin-top: 10px;">Empowering African Entrepreneurs</p>
    </div>

    <div class="content">
      <h2 class="greeting">Hello ${data.fullName}! 👋</h2>
      <p>Thank you for applying to the <strong>Grantera Grant Program</strong>. We've successfully received your application.</p>
      <div class="code-box">
        <p>Your Unique Application Code:</p>
        <div class="code">${data.uniqueCode}</div>
        <p style="font-size: 13px;">⚠️ Save this code – you'll need it for your proposal submission.</p>
      </div>
      <div class="highlight">📄 Next Step: Submit Your Business Proposal</div>
      <p>You can now go ahead and submit your business proposal if you haven't already at: </p>
      <ul>
        <li><a href="Grantera.org/submit-proposal" target="_blank">Grantera.org/submit-proposal<a/></li>
      </ul>
      ${
        data.wantsMentorship
          ? `<p style="background:#fff3cd; padding:15px; border-left:4px solid #FFB800; border-radius:8px;">
              🎯 <strong>Mentorship:</strong> You're enrolled! Our mentors will contact you soon.
            </p>`
          : ''
      }
      <p><strong>Application Details:</strong><br>Business: ${
        data.businessName
      }<br>Grant Amount: ₦${Number(data.grantAmount).toLocaleString()}</p>
    </div>

    <div class="footer">
      <p><strong>Grantera</strong></p>
      <p>noreply@grantera.com</p>
      <p style="font-size:12px; color:#999;">© 2025 Grantera. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

//successful submission of proposal

export const proposalMail = (applicantName) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grantera Proposal Confirmation</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>

  <body class="bg-gray-50 font-sans antialiased">
    <div class="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-10">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-800 via-green-600 to-green-500 text-white py-6 px-8 text-center">
        <h1 class="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <img src="https://firebasestorage.googleapis.com/v0/b/the-grantera-hub-ecac0.firebasestorage.app/o/logo.svg?alt=media&token=46065c38-0916-454e-b212-a4c303e7d9da" alt="Grantera Logo" class="h-14 w-14 flex justify-center items-center backdrop-blur-lg bg-amber-300/60 rounded-full pt-2" />
          Grantera
        </h1>
        <p class="text-sm opacity-90 mt-1">
          Empowering Africa’s Boldest Innovators
        </p>
      </div>

      <!-- Body -->
      <div class="px-8 py-6 text-gray-700">
        <h2 class="text-xl font-semibold mb-3 text-green-700">Proposal Received 🎉</h2>

        <p class="text-sm leading-relaxed mb-4">
          Hi <span class="font-semibold text-gray-900">${applicantName}</span>,
        </p>

        <p class="text-sm leading-relaxed mb-4">
          Great news — your proposal has been successfully received by the 
          <span class="text-green-700 font-semibold">Grantera Review Team</span>.
        </p>

        <p class="text-sm leading-relaxed mb-4">
          Our reviewers are currently assessing submissions based on creativity,
          feasibility, and real-world impact. You’ll be notified as soon as your proposal
          advances to the next phase.
        </p>

        <div class="bg-green-50 border-l-4 border-green-600 rounded-md px-4 py-3 mt-6">
          <p class="text-sm text-green-800 font-medium">
            💡 Keep pushing forward — innovation starts with bold ideas like yours.
          </p>
        </div>

        <div class="mt-6 text-sm text-gray-500">
          <p>
            This is a <span class="font-semibold text-gray-800">no-reply</span> email.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-100 text-center py-4 text-xs text-gray-500">
        <p>© 2025 Grantera. All rights reserved.</p>
        <p class="mt-1">Driving Innovation. Powering Opportunity.</p>
      </div>
    </div>
  </body>
</html>

`

export default function GranteraEmailSystem() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const applicant = {
    email: 'divineanyanechi@gmail.com',
    fullName: 'John Doe',
    uniqueCode: 'GRA-2025-XYZ789',
    businessName: 'Tech Solutions Ltd',
    grantAmount: 500000,
    wantsMentorship: true,
  }

  const handleSend = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const html = buildApplicantEmail(applicant)
      const result = await sendEmail(
        applicant.email,
        'Grantera Application Received ✅',
        html,
        'We’ve received your application!'
      )
      setStatus({ type: 'success', message: `Email queued: ${result.id}` })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  ///preview
  // const emailPreview = buildApplicantEmail(applicant)
  const emailPreview = proposalMail('honour')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Grantera Email System
            </h1>
            <p className="text-gray-600">
              Dynamic Email Sender (Firestore + SMTP)
            </p>
          </div>
          <Mail className="w-10 h-10 text-green-600" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" /> Send Test Email
              </>
            )}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            {showPreview ? 'Hide Preview' : 'Show Email Preview'}
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
              status.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p
                className={`font-semibold ${
                  status.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {status.type === 'success' ? '✅ Success' : '❌ Error'}
              </p>
              <p
                className={`text-sm ${
                  status.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {status.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Preview */}
      {showPreview && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">📧 Email Preview</h2>
          <iframe
            srcDoc={emailPreview}
            className="w-full h-[800px] border-0 rounded-lg"
            title="Email Preview"
          />
        </div>
      )}
    </div>
  )
}
