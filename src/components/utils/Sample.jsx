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
  <meta charset="UTF-8">
  <title>Grantera Grant Application</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Arial, sans-serif; background-color:#f5f5f5;">
  <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #003366, #00994C); padding:40px 30px; text-align:center; color:#fff;">
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;">
        <img src="https://res.cloudinary.com/dlcmo3jrt/image/upload/v1760556629/Grantera_logo_2x_rl8lrc.png" 
             alt="Grantera Logo" 
             width="70" height="70" 
             style="display:block; border-radius:50%; margin:0;" />
        <h1 style="font-size:36px; font-weight:900; margin:0; color:#fff; line-height:1.2;">Grantera</h1>
      </div>
      <p style="color:#FFB800; margin-top:10px; font-size:14px;">Empowering African Entrepreneurs</p>
    </div>

    <!-- Content -->
    <div style="padding:40px 30px; color:#333;">
      <h2 style="font-size:24px; color:#003366; margin-bottom:20px;">Hello ${
        data.fullName
      }! 👋</h2>
      <p>Thank you for applying to the <strong>Grantera Grant Program</strong>. We've successfully received your application.</p>
      
      <div style="background:#f8f9fa; border-left:4px solid #00994C; padding:20px; margin:30px 0; border-radius:8px;">
        <p>Your Unique Application Code:</p>
        <div style="font-size:28px; font-weight:bold; color:#00994C; letter-spacing:2px; margin:10px 0;">
          ${data.uniqueCode}
        </div>
        <p style="font-size:13px;">⚠️ Save this code – you'll need it for your proposal submission.</p>
      </div>

      <div style="background:#FFB800; color:#003366; padding:12px 24px; border-radius:6px; display:inline-block; margin:20px 0; font-weight:600;">
        📄 Next Step: Submit Your Business Proposal
      </div>

      <p>You can now go ahead and submit your business proposal if you haven't already at:</p>
      <ul>
        <li><a href="https://Grantera.org/submit-proposal" target="_blank" style="color:#00994C;">Grantera.org/submit-proposal</a></li>
      </ul>

      ${
        data.wantsMentorship
          ? `<p style="background:#fff3cd; padding:15px; border-left:4px solid #FFB800; border-radius:8px; margin:20px 0;">
              🎯 <strong>Mentorship:</strong> You're enrolled! Our mentors will contact you soon.
            </p>`
          : ''
      }

      <p><strong>Application Details:</strong><br>
      Business: ${data.businessName}<br>
      Grant Amount: ₦${Number(data.grantAmount).toLocaleString()}</p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa; padding:30px; text-align:center; color:#666; font-size:14px;">
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
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Arial, sans-serif; background-color:#f5f5f5;">
  <div style="max-width:480px; margin:40px auto; background:#fff; border-radius:16px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border:1px solid #f3f3f3; overflow:hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #003366, #00994C); color:#fff; padding:32px 24px; text-align:center;">
      <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
        <img src="https://res.cloudinary.com/dlcmo3jrt/image/upload/v1760556629/Grantera_logo_2x_rl8lrc.png" 
             alt="Grantera Logo" 
             width="60" height="60" 
             style="display:block; border-radius:50%; background:rgba(255,255,255,0.2); padding:4px;" />
        <h1 style="font-size:28px; font-weight:800; margin:0; color:#fff; line-height:1.2;">Grantera</h1>
      </div>
      <p style="font-size:14px; opacity:0.9; margin-top:8px;">Empowering Africa’s Boldest Innovators</p>
    </div>

    <!-- Body -->
    <div style="padding:24px; color:#333;">
      <h2 style="font-size:20px; font-weight:600; margin-bottom:16px; color:#00994C;">Proposal Received 🎉</h2>

      <p style="font-size:14px; line-height:1.5; margin-bottom:12px;">
        Hi <span style="font-weight:600; color:#111;">${applicantName}</span>,
      </p>

      <p style="font-size:14px; line-height:1.5; margin-bottom:12px;">
        Great news — your proposal has been successfully received by the 
        <span style="color:#00994C; font-weight:600;">Grantera Review Team</span>.
      </p>

      <p style="font-size:14px; line-height:1.5; margin-bottom:12px;">
        Our reviewers are currently assessing submissions based on creativity,
        feasibility, and real-world impact. You’ll be notified as soon as your proposal
        advances to the next phase.
      </p>

      <div style="background:#e6f4ea; border-left:4px solid #00994C; border-radius:8px; padding:12px; margin-top:16px;">
        <p style="font-size:14px; font-weight:500; color:#006633; margin:0;">
          💡 Keep pushing forward — innovation starts with bold ideas like yours.
        </p>
      </div>

      <div style="margin-top:16px; font-size:12px; color:#777;">
        <p>This is a <span style="font-weight:600; color:#333;">no-reply</span> email.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f3f3f3; text-align:center; padding:16px; font-size:12px; color:#777;">
      <p style="margin:0;">© 2025 Grantera. All rights reserved.</p>
      <p style="margin-top:4px;">Driving Innovation. Powering Opportunity.</p>
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

  //const emailPreview = buildApplicantEmail(applicant)
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
