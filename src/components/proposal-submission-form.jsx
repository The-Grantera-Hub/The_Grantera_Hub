import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Copy, Mail, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CheckCircle2,
  Upload,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { setDoc, doc } from 'firebase/firestore'
import { storage, db, functions } from '@/firebaseConfig'
import { connectFunctionsEmulator, httpsCallable } from 'firebase/functions'
import { useSpinner } from '@/components/SpinnerProvider'
import { toast } from 'sonner'
import { proposalMail, sendEmail } from '@/components/utils/Sample'
import { Navigation } from '@/components/navigation'


export default function ProposalSubmissionForm() {
  const { appContext, setAppContext, alertMsg, setAlertMsg } = useSpinner()
  const [uniqueCode, setUniqueCode] = useState('')
  const [email, setEmail] = useState(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const codeRef = useRef(null)
  const submitRef = useRef(null)
  

  if (!codeRef.current) {
    codeRef.current = httpsCallable(functions, 'getUserUniqueCode')
  }

  if (!submitRef.current) {
    submitRef.current = httpsCallable(functions, 'submitProposal')
  }

  useEffect(() => {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }, [])

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const isCodeValid = uniqueCode.length > 0 && uniqueCode.startsWith('GRA-')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a PDF or DOCX file only.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10 MB.'
    }
    return null
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setError('')

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validationError = validateFile(droppedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e) => {
    setError('')
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(selectedFile)
    }
  }

//send mail to applicant after succesful upload
const handleSend = async (name,email) => {
    try {
      const html = proposalMail(name)
      const result = await sendEmail(
        email,
        'Grantera Application Received ✅',
        html,
        'We’ve received your application!'
      )
      toast.success({ type: 'success', message: `Email queued: ${result.id}` })
    } catch (err) {
      toast.error({ type: 'error', message: err.message })
    }
  }


  //start
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isCodeValid) {
      setError('Please enter a valid Grantera code.')
      return
    }

    if (!file) {
      setError('Please upload your business proposal.')
      return
    }

    //get User's code
    setAppContext({ ...appContext, spinner: true })
    const res = await codeRef.current({ uniqueCode })
    if (res.data.status === 'error') {
      setAppContext({ ...appContext, spinner: false })
      if (res.data.message === 'Could Not Verify Applicant') {
        return setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: 'Sorry it seems the code you entered is invalid, please recheck the code and try again.',
          statusMsg: 'Incorrect Grantera Code',
        })
      } else if (
        res.data.message ===
        'It seems Applicant proposal has been submitted in the past'
      ) {
        return setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: res.data.message,
          statusMsg: 'Duplicate Submission Not Allowed',
        })
      } else {
        return setAlertMsg({
          ...alertMsg,
          open: true,
          status: false,
          msg: res.data.message,
          statusMsg: 'Sorry an error occurred at our end',
        })
      }
    }

    //put off the spinner after verifying uniqueCode
    setAppContext({ ...appContext, spinner: false })
    //if the code is correct set the user's email
    setEmail(res.data.email)
    // ✅ Initialize upload states
    setIsUploading(true)
    setUploadProgress(0)
    setError('')
    setIsSubmitted(false)

    try {
      // 🔹 Step 1: Create a storage reference
      const fileRef = ref(storage, `proposals/${uniqueCode}_${file.name}`)

      // 🔹 Step 2: Start resumable upload to track progress
      const uploadTask = uploadBytesResumable(fileRef, file)

      // 🔹 Step 3: Listen to upload events (progress, error, complete)
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Update progress based on bytes transferred
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(Math.round(progress))
        },
        (error) => {
          console.error('Upload failed:', error)
          setError('Upload failed. Please try again.')
          setIsUploading(false)
        },
        async () => {
          // 🔹 Step 4: On complete, get the file’s URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // 🔹 Step 5: Store file metadata in Firestore
          const applicant = await submitRef.current({
            fileName: `${uniqueCode}_${file.name}`,
            fileUrl: downloadURL,
            uniqueCode,
          })

          if (applicant?.data?.state === 'error') {
            if (
              applicant?.data?.message ===
              'seems you might have uploaded your proposal in the past'
            ) {
              setIsUploading(false)
              setIsSubmitted(false)
              return toast.error(applicant?.data?.message)
            } else if (
              applicant?.data?.message ===
              'an error occured with the server while uploading'
            ) {
              setIsUploading(false)
              setIsSubmitted(false)
              return toast.error(applicant?.data?.message)
            } else if (applicant?.data?.message === 'Applicant not found') {
              setIsUploading(false)
              setIsSubmitted(false)
              return toast.error(applicant?.data?.message)
            } else {
              setIsUploading(false)
              setIsSubmitted(false)
              return toast.error(
                'Sorry an error occured while uploading your details, try reaching out to us'
              )
            }
          }

          setIsUploading(false)
          setIsSubmitted(true)
          toast.success('Proposal uploaded successfully!')
          //send to the applicants a congratulatory mail
          await handleSend(res.data.name, res.data.email)
        }
      )
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Something went wrong while uploading.')
      setIsUploading(false)
    }
  }
  //end

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (isSubmitted) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Card className="border-[#00994C] shadow-lg rounded-lg p-4">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#00994C]/10 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-[#00994C]" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-playfair)] text-[#003366]">
                Application Submitted Successfully!
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
                Thank you for applying to Grantera. We've received your
                application and will review it carefully.
              </p>

              <div className="bg-[#FFB800]/10 border-2 border-[#FFB800] rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Your Application Code
                </p>
                <p className="text-2xl font-bold text-[#003366] font-mono">
                  {uniqueCode}
                </p>
              </div>

              <Alert className="text-left mb-6">
                <Mail className="h-4 w-4" />
                <AlertDescription className="-mt-5 ml-6">
                  <p className="font-semibold mb-2">What happens next?</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Confirmation email sent to {email}</li>
                    <li>• Application review takes 2-4 weeks</li>
                    <li>• You'll be notified of the decision via email</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                asChild
                className="bg-[#003366] hover:bg-[#00994C] text-white"
              >
                <a href="/">Return to Homepage</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <div
      className={`min-h-screen ${
        appContext.spinner ? 'h-screen overflow-hidden' : ''
      }bg-gradient-to-br from-primary/5 via-background to-secondary/5`}
    >
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6"><Navigation/></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Submit Your Business Proposal
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your comprehensive business plan to complete your grant
            application. Ensure your proposal clearly presents your business
            goals, market strategy, and funding needs.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Unique Code Verification */}
              <div className="space-y-3">
                <Label htmlFor="uniqueCode" className="text-base font-semibold">
                  Enter Your Unique Grantera Code
                </Label>
                <Input
                  id="uniqueCode"
                  type="text"
                  placeholder="GRA-2025-XXXXXX"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  className="text-lg h-12"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This code was sent to your email after payment confirmation.
                </p>
              </div>

              {/* File Upload Area */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Upload Your Business Proposal
                </Label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all
                    ${
                      isDragging
                        ? 'border-secondary bg-secondary/5'
                        : 'border-border hover:border-secondary/50'
                    }
                    ${file ? 'bg-secondary/5' : 'bg-muted/30'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-secondary" />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drag and drop your file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        PDF or DOCX • Max 10 MB
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-secondary" />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-foreground mb-1">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {formatFileSize(file.size)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null)
                          if (fileInputRef.current)
                            fileInputRef.current.value = ''
                        }}
                      >
                        Remove File
                      </Button>
                    </>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Uploading...
                      </span>
                      <span className="font-medium text-foreground">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Important Notice */}
              <Alert className="border-accent bg-accent/10">
                <AlertCircle className="h-4 w-4 text-accent-foreground" />
                <AlertDescription className="text-accent-foreground">
                  <strong>Important:</strong> Ensure your proposal includes
                  detailed information about your business model, target market,
                  financial projections, and how the grant will be utilized.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14"
                disabled={!isCodeValid || !file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Submit Proposal'}
              </Button>
            </form>
          </div>

          {/* Motivational Section */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-gradient-to-br from-[#003366] to-[#00994C] rounded-2xl p-8 md:p-10">
              <p className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 text-fuchsia-50">
                "Every great business starts with a bold vision."
              </p>
              <p className="text-gray-300">
                Your proposal is the first step toward turning your
                entrepreneurial dreams into reality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
