import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Search,
  Bell,
  LinkIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Brain,
  LogOut,
  Download,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Send,
  BarChart3,
  Building2,
  Target,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '@/firebaseConfig'
import {
  getDocs,
  setDoc,
  doc,
  collection,
  getDoc,
  query,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { signOut } from 'firebase/auth'
import DocumentViewer from '@/components/PDFViewer'
import { useRetryAI } from '@/components/useRetryAI'
import { onAuthStateChanged } from 'firebase/auth'
import { useSpinner } from '@/components/SpinnerProvider'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AffiliateStats } from '@/components/statsCard-affiliate-admin'
import { AffiliateTable } from '@/components/affiliateTable'

const StatusBadge = memo(({ status }) => {
  const config = useMemo(
    () => ({
      draft: {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        label: 'Draft',
        icon: FileText,
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Pending',
        icon: Clock,
      },
      processing: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Processing',
        icon: Loader2,
      },
      'under-review': {
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        label: 'Under Review',
        icon: Eye,
      },
      approved: {
        color: 'bg-[#00994C]/10 text-[#00994C] border-[#00994C]/30',
        label: 'Approved',
        icon: CheckCircle,
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Rejected',
        icon: XCircle,
      },
      failed: {
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Failed',
        icon: AlertCircle,
      },
      potential: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Potential',
        icon: Target,
      },
      'suggested-approval': {
        color: 'bg-green-100 text-green-800 border-green-300',
        label: 'Suggested Approval',
        icon: CheckCircle,
      },
    }),
    []
  )

  const { color, label, icon: Icon } = config[status] || config.pending
  return (
    <Badge variant="outline" className={`${color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
})
StatusBadge.displayName = 'StatusBadge'

const AIStatusBadge = memo(({ aiStatus }) => {
  const config = useMemo(
    () => ({
      idle: {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        label: 'Idle',
        icon: Brain,
      },
      processing: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Processing',
        icon: Loader2,
      },
      completed: {
        color: 'bg-[#00994C]/10 text-[#00994C] border-[#00994C]/30',
        label: 'Completed',
        icon: CheckCircle,
      },
      failed: {
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Failed',
        icon: XCircle,
      },
    }),
    []
  )

  const { color, label, icon: Icon } = config[aiStatus] || config.idle
  return (
    <Badge variant="outline" className={`${color} border text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
})
AIStatusBadge.displayName = 'AIStatusBadge'

const MetricCard = memo(
  ({ title, value, icon: Icon, trend, color = 'text-[#00994C]' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
)
MetricCard.displayName = 'MetricCard'

const ProposalRow = memo(({ proposal, onView, onReassign, currentUser }) => (
  <TableRow>
    <TableCell className="font-medium">{proposal.fullName}</TableCell>
    <TableCell>{proposal.uniqueCode}</TableCell>
    <TableCell>{proposal.businessName}</TableCell>
    <TableCell>
      <StatusBadge status={proposal.status} />
    </TableCell>
    <TableCell>
      <AIStatusBadge aiStatus={proposal.aiStatus || 'idle'} />
    </TableCell>
    <TableCell>{proposal.grantAmount}</TableCell>
    <TableCell>
      {proposal.createdAt
        ? new Date(proposal.createdAt).toLocaleDateString()
        : 'N/A'}
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onView(proposal)}>
          <Eye className="h-4 w-4" />
        </Button>
        {currentUser?.role === 'admin' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReassign(proposal)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
))
ProposalRow.displayName = 'ProposalRow'

export default function AdminDashboard() {
  const handleRetryAI = useRetryAI()
  const navigate = useNavigate()
  const { appContext, setAppContext } = useSpinner()

  // State management
  const [proposals, setProposals] = useState(null)
  const [currentUser, setCurrentUser] = useState({
    uid: 'admin_001',
    name: 'Admin User',
    email: 'admin@grantera.ng',
    role: 'admin',
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [affiliates, setAffiliates] = useState(null)
  const [authUser, setAuthUser] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiStatusFilter, setAiStatusFilter] = useState('all')
  const [reviewerFilter, setReviewerFilter] = useState('all')
  const [affiliatesFilter, setAffiliatesFilter] = useState('all')
  const [grantAmountFilter, setGrantAmountFilter] = useState('all')
  const [mentorshipFilter, setMentorshipFilter] = useState('all')
  const [reviewers, setReviewers] = useState(null)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [proposalToReassign, setProposalToReassign] = useState(null)
  const [openFile, setOpenFile] = useState(false)
  const [selectedReviewerId, setSelectedReviewerId] = useState('')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [notifications, setNotifications] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [activities, setActivities] = useState(null)

  useEffect(() => {
    setAppContext({ ...appContext, spinner: true })

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(true)
        toast.success(`Welcome back, ${user.uid}👋🏼`)

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data())
        }
      } else {
        setAuthUser(false)
        navigate('/admin/login')
        toast.error('Please Login to access this page')
      }
      setAppContext({ ...appContext, spinner: false })
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    if (!authUser) return

    const applicantsRef = collection(db, 'applicants')
    const unsubscribe = onSnapshot(
      applicantsRef,
      (snapshot) => {
        const applications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: new Date(
            doc.data()?.createdAt?.seconds * 1000 +
              doc.data()?.createdAt?.nanoseconds / 1000000
          ),
        }))
        setProposals(applications)
      },
      (error) => {
        console.error('Error fetching proposals:', error)
        toast.error(`Error fetching proposals: ${error.message}`)
      }
    )

    return () => unsubscribe()
  }, [authUser])

  useEffect(() => {
    if (!authUser) return

    const panelist = collection(db, 'users')
    const unsubscribe = onSnapshot(
      panelist,
      (snapshot) => {
        const review = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setReviewers(review)
      },
      (error) => {
        console.error('Error fetching reviewers:', error)
      }
    )

    return () => unsubscribe()
  }, [authUser])

  useEffect(() => {
    if (!authUser) return

    const affiliates = collection(db, 'affiliatesSummary')
    const unsubscribe = onSnapshot(
      affiliates,
      (snapshot) => {
        const referrers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAffiliates(referrers)
      },
      (error) => {
        console.error('Error fetching affiliates:', error)
      }
    )

    return () => unsubscribe()
  }, [authUser])

  useEffect(() => {
    if (!authUser) return

    const notificationsRef = collection(db, 'notifications')
    const unsubscribe = onSnapshot(
      notificationsRef,
      (snapshot) => {
        const notify = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setNotifications(notify)
      },
      (error) => {
        console.error('Error fetching notifications:', error)
      }
    )

    return () => unsubscribe()
  }, [authUser])

  useEffect(() => {
    if (!authUser) return

    const metricsRef = doc(db, 'proposals', 'metrics')
    const unsubscribe = onSnapshot(
      metricsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMetrics(snapshot.data())
        }
      },
      (error) => {
        console.error('Error fetching metrics:', error)
      }
    )

    return () => unsubscribe()
  }, [authUser])

  const filteredProposals = useMemo(() => {
    if (!proposals) return []

    let filtered = proposals
    // console.log("proposals", proposals)

    if (currentUser?.role === 'reviewer') {
      filtered = filtered.filter(
        (p) => p?.assignedReviewerId === currentUser?.id
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.uniqueCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (aiStatusFilter !== 'all') {
      filtered = filtered.filter((p) => p.aiStatus === aiStatusFilter)
    }

    if (reviewerFilter !== 'all') {
      filtered = filtered.filter((p) => p.assignedReviewerId === reviewerFilter)
    }

    if (affiliatesFilter !== 'all') {
      filtered = filtered.filter((p) => p.affiliateName === affiliatesFilter)
    }

    if (grantAmountFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const amount = Number.parseInt(
          p.grantAmount?.replace(/[₦,]/g, '') || '0'
        )
        switch (grantAmountFilter) {
          case '0-1m':
            return amount < 1000000
          case '1m-3m':
            return amount >= 1000000 && amount < 3000000
          case '3m-5m':
            return amount >= 3000000 && amount < 5000000
          case '5m+':
            return amount >= 5000000
          default:
            return true
        }
      })
    }

    if (mentorshipFilter !== 'all') {
      filtered = filtered.filter((p) => {
        if (mentorshipFilter === 'yes') return p.wantsMentorship === true
        if (mentorshipFilter === 'no') return p.wantsMentorship === false
        return true
      })
    }

    return filtered
  }, [
    proposals,
    searchQuery,
    statusFilter,
    aiStatusFilter,
    reviewerFilter,
    affiliatesFilter,
    grantAmountFilter,
    mentorshipFilter,
    currentUser,
  ])

  const getStatusChartData = useMemo(() => {
    if (!proposals) return {}

    return {
      pending: proposals?.filter((p) => p?.status === 'pending')?.length || 0,
      processing:
        proposals?.filter((p) => p?.status === 'processing')?.length || 0,
      'under-review':
        proposals?.filter((p) => p?.status === 'under-review')?.length || 0,
      approved: proposals?.filter((p) => p?.status === 'approved')?.length || 0,
      rejected: proposals?.filter((p) => p?.status === 'rejected')?.length || 0,
      failed: proposals?.filter((p) => p?.status === 'failed')?.length || 0,
      potential:
        proposals?.filter((p) => p?.status === 'potential')?.length || 0,
      'suggested-approval':
        proposals?.filter((p) => p.status === 'suggested-approval')?.length ||
        0,
    }
  }, [proposals])

  const getReviewerChartData = useMemo(() => {
    if (!reviewers) return []

    return reviewers
      ?.filter((r) => r.role === 'reviewer')
      .map((r) => ({
        name: r.name,
        count: r.assignedCount || 0,
      }))
  }, [reviewers])

  const filteredReviewers = useMemo(() => {
    if (!reviewers) return []
    return reviewers.filter((r) => r.role?.toLowerCase() === 'reviewer')
  }, [reviewers])

  const filteredAffiliates = useMemo(() => {
    if (!affiliates) return []
    //return affiliates.filter((r) => r.role?.toLowerCase() === 'reviewer')
    //return affiliates.filter((r) => r.role?.toLowerCase() === 'reviewer')
    return affiliates
  }, [affiliates])

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
      { id: 'proposals', label: 'Proposals', icon: FileText },
      // { id: 'reviewers', label: 'Reviewers', icon: Users },
      { id: 'ai-logs', label: 'AI Logs', icon: Brain },
      { id: 'affiliates', label: 'Affiliates', icon: Users },
    ],
    []
  )

  /* const toggleRole = useCallback(() => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'reviewer' : 'admin',
      name: prev.role === 'admin' ? 'Dr. Okonkwo' : 'Admin User',
      uid: prev.role === 'admin' ? 'rev_001' : 'admin_001',
    }))
  }, []) */

  const SignOut = useCallback(() => {
    signOut(auth).then(() => {
      navigate('/admin/login')
    })
  }, [navigate])

  const exportToCSV = useCallback(() => {
    if (!filteredProposals || filteredProposals.length === 0) {
      toast.info('No proposals to export!')
      return
    }

    const headers = [
      'Applicant',
      'Unique Code',
      'Status',
      'AI Status',
      'AI Score',
      'Reviewer',
      'Submitted',
    ]

    const rows = filteredProposals.map((proposal) => {
      const reviewerName =
        reviewers?.find((r) => r.id === proposal.assignedReviewerId)?.name ||
        'Unassigned'

      return [
        proposal.fullName,
        proposal.uniqueCode,
        proposal.status,
        proposal.aiStatus,
        proposal.aiScore || 'N/A',
        reviewerName,
        new Date(proposal.createdAt).toLocaleDateString(),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `proposals_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [filteredProposals, reviewers])

  const downloadFromURL = useCallback(async (url, fileName) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName || 'document.pdf'
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [])

  const handleAssignReviewer = useCallback(
    (proposalId, reviewerId) => {
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            const oldReviewerId = p.assignedReviewerId

            addDoc(collection(db, `proposals/${proposalId}/activity`), {
              actorId: currentUser.id,
              actorName: currentUser.name,
              action: oldReviewerId
                ? 'Reassigned reviewer'
                : 'Assigned reviewer',
              from: oldReviewerId
                ? reviewers?.find((r) => r.id === oldReviewerId)?.name
                : null,
              to: reviewers?.find((r) => r.id === reviewerId)?.name,
              createdAt: serverTimestamp(),
            })

            return { ...p, assignedReviewerId: reviewerId }
          }
          return p
        })
      )

      setReviewers((prev) =>
        prev.map((r) => {
          if (r.id === reviewerId) {
            return { ...r, assignedCount: (r.assignedCount || 0) + 1 }
          }
          const proposal = proposals?.find((p) => p.id === proposalId)
          if (proposal?.assignedReviewerId === r.id) {
            return {
              ...r,
              assignedCount: Math.max(0, (r.assignedCount || 0) - 1),
            }
          }
          return r
        })
      )
    },
    [currentUser, reviewers, proposals]
  )

  const handleOpenReassignModal = useCallback((proposal) => {
    setProposalToReassign(proposal)
    setSelectedReviewerId(proposal.assignedReviewerId || '')
    setShowReassignModal(true)
  }, [])

  const handleConfirmReassign = useCallback(async () => {
    if (selectedReviewerId && proposalToReassign) {
      try {
        setAppContext({ ...appContext, spinner: true })

        // Document references
        const applicantsRef = doc(db, 'applicants', proposalToReassign.id)
        const reviewerRef = doc(db, 'users', selectedReviewerId)

        // Fetch new reviewer data
        const reviewerSnap = await getDoc(reviewerRef)
        if (!reviewerSnap.exists())
          throw new Error('Selected reviewer not found')
        const reviewerData = reviewerSnap.data()

        // Fetch applicant data
        const applicantSnap = await getDoc(applicantsRef)
        if (!applicantSnap.exists()) throw new Error('Applicant not found')
        const applicantData = applicantSnap.data()

        const prevReviewerID = applicantData?.assignedReviewerId

        // If a previous reviewer exists, decrement their assignedCount
        if (prevReviewerID) {
          const prevReviewerRef = doc(db, 'users', prevReviewerID)
          const prevReviewerSnap = await getDoc(prevReviewerRef)
          if (prevReviewerSnap.exists()) {
            const prevData = prevReviewerSnap.data()
            await setDoc(
              prevReviewerRef,
              {
                assignedCount: Math.max((prevData.assignedCount || 1) - 1, 0),
              },
              { merge: true }
            )
          }
        }

        // Increment the new reviewer's assignedCount
        await setDoc(
          reviewerRef,
          {
            assignedCount: (reviewerData.assignedCount || 0) + 1,
          },
          { merge: true }
        )

        // Update applicant's assigned reviewer info
        await setDoc(
          applicantsRef,
          {
            assignedReviewerId: selectedReviewerId,
            assignedReviewerName: reviewerData?.name,
          },
          { merge: true }
        )

        setShowReassignModal(false)
        toast.success('Reviewer reassigned successfully!')
      } catch (error) {
        console.error('Error reassigning reviewer:', error)
        toast.error('Failed to assign reviewer')
      } finally {
        setAppContext({ ...appContext, spinner: false })
      }
    }
  }, [selectedReviewerId, proposalToReassign, appContext, setAppContext])

  const handleChangeStatus = useCallback(
    async (proposalId, newStatus) => {
      const proposal = proposals?.find((p) => p?.uniqueCode === proposalId)

      if (currentUser.role === 'reviewer' && newStatus === 'approved') {
        toast.warning('Only admins can give final approval')
        return
      }

      if (
        proposal?.status === 'approved' &&
        currentUser.role === 'reviewer' &&
        newStatus != proposal?.status
      ) {
        return toast.warning('only the admin can revert this proposal state')
      }

      setProposals((prev) =>
        prev.map((p) => {
          if (p.uniqueCode === proposalId) {
            addDoc(collection(db, `proposals/${proposalId}/activity`), {
              actorId: currentUser.id,
              actorName: currentUser.name,
              action: 'Status changed',
              from: p.status,
              to: newStatus,
              createdAt: serverTimestamp(),
            })
            return {
              ...p,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          }
          return p
        })
      )

      const applicantStateRef = doc(db, 'applicants', selectedProposal.id)
      return await setDoc(
        applicantStateRef,
        {
          status: newStatus,
          stateChangedBy: currentUser?.id || '',
        },
        { merge: true }
      )
    },
    [proposals, currentUser, selectedProposal]
  )

  const handleViewProposal = useCallback((proposal) => {
    setSelectedProposal(proposal)
    setShowProposalModal(true)

    // const activityRef = collection(db, `proposals/${proposal.id}/activity`)
    // const a = query(activityRef, orderBy('createdAt', 'desc'), limit(10))
    // getDocs(a).then((snapshot) => {
    //   const activitiesData = snapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   }))
    //   setActivities(activitiesData)
    // })

    const activityRef = collection(db, `proposals/${proposal.id}/activity`)
    const a = query(activityRef, orderBy('createdAt', 'desc'), limit(10))
    getDocs(a).then((snapshot) => {
      const activitiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setActivities(activitiesData)
    })

    const commentsRef = collection(db, `proposals/${proposal.id}/comments`)
    const q = query(commentsRef, orderBy('createdAt', 'desc'))
    getDocs(q).then((snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setComments((prev) => ({ ...prev, [proposal.id]: commentsData }))
    })
  }, [])

  const handleAddComment = useCallback(
    (proposalId) => {
      if (!newComment.trim()) return

      const comment = {
        id: `comment_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        content: newComment,
        createdAt: new Date().toISOString(),
      }

      addDoc(collection(db, `proposals/${proposalId}/comments`), comment)

      setComments((prev) => ({
        ...prev,
        [proposalId]: [comment, ...(prev[proposalId] || [])],
      }))
      setNewComment('')
    },
    [newComment, currentUser]
  )

  const getVisibleComments = useCallback(
    (proposalId) => {
      const proposalComments = comments[proposalId] || []

      if (currentUser.role === 'admin') {
        return proposalComments
      }

      return proposalComments.filter((c) => c.authorId === currentUser.id)
    },
    [comments, currentUser]
  )

  const RetryAI = useCallback(
    (proposalId) => {
      handleRetryAI(proposalId)

      addDoc(collection(db, `proposals/${proposalId}/activity`), {
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'Retry AI Processing',
        createdAt: serverTimestamp(),
      })
      setDoc(
        doc(db, `applicants/${proposalId}`),
        {
          aiStatus: 'processing',
          aiError: null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            return {
              ...p,
              aiStatus: 'processing',
              aiError: null,
              updatedAt: new Date().toISOString(),
            }
          }
          return p
        })
      )
      toast.info(`AI processing retried for proposal ${proposalId}`)
    },
    [handleRetryAI, currentUser]
  )

  const handleSendBroadcast = useCallback(() => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.info('Please fill in both title and message')
      return
    }

    addDoc(collection(db, 'notifications'), {
      title: broadcastTitle,
      body: broadcastMessage,
      createdAt: serverTimestamp(),
      broadcast: true,
      target: null,
      createdBy: currentUser.id,
    })

    const newNotification = {
      id: `notif_${Date.now()}`,
      title: broadcastTitle,
      body: broadcastMessage,
      createdAt: new Date().toISOString(),
      broadcast: true,
      target: null,
    }

    setNotifications((prev) => [newNotification, ...prev])
    setBroadcastTitle('')
    setBroadcastMessage('')
    setShowBroadcastModal(false)
    toast.success('Broadcast message sent successfully!')
  }, [broadcastTitle, broadcastMessage, currentUser])

  const getStatusBadge = useCallback((status) => {
    return <StatusBadge status={status} />
  }, [])

  const getAIStatusBadge = useCallback((aiStatus) => {
    return <AIStatusBadge aiStatus={aiStatus} />
  }, [])

  if (!authUser) {
    return null
  }

  return (
    <>
      {authUser && (
        <div className="flex h-screen bg-[#F5F5F5]">
          {/* Left Sidebar */}
          <aside
            className={`${
              sidebarCollapsed ? 'w-16' : 'w-64'
            } bg-[#003366] text-white transition-all duration-300 flex flex-col`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold font-serif">Grantera Admin</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-white hover:bg-white/10"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </Button>
            </div>

            <nav className="flex-1 p-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-amber-600 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={SignOut}
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {!sidebarCollapsed && 'Logout'}
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search proposals, applicants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {currentUser.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBroadcastModal(true)}
                      className="gap-2 bg-[#00994C]/10 border-[#00994C] text-[#003366] hover:bg-[#00994C]/20"
                    >
                      <Send className="w-4 h-4" />
                      Send Broadcast
                    </Button>
                  )}

                  {/*  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleRole}
                    className="gap-2 bg-[#FFB800]/10 border-[#FFB800] text-[#003366] hover:bg-[#FFB800]/20 max-[600px]:text-sm"
                  >
                    <Users className="w-4 h-4" />
                    Switch to{' '}
                    {currentUser.role === 'admin' ? 'reviewer' : 'admin'} View
                  </Button>
 */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      {notifications?.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFB800] rounded-full"></span>
                      )}
                    </Button>

                    {showNotifications && (
                      <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-semibold text-[#003366]">
                            Notifications
                          </h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications?.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No new notifications
                            </div>
                          ) : (
                            notifications?.map((notif) => (
                              <div
                                key={notif.id}
                                className="p-4 border-b border-gray-100 hover:bg-gray-50"
                              >
                                <h4 className="font-medium text-sm text-[#003366]">
                                  {notif.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notif.body}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(
                                    notif.createdAt
                                      ?.toDate?.()
                                      ?.toISOString?.() || notif.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center text-white font-semibold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-[#1E1E1E]">
                        {currentUser.name}
                      </div>
                      <div className="text-gray-500 capitalize">
                        {currentUser.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6">
              {activeTab === 'dashboard' && (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Total Applicants
                        </CardTitle>
                        <Users className="h-5 w-5 text-[#003366]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.applicantsCount || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Proposals Submitted
                        </CardTitle>
                        <FileText className="h-5 w-5 text-[#003366]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.proposalsCount || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Total Processed
                        </CardTitle>
                        <CheckCircle className="h-5 w-5 text-[#00994C]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.processingCount || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          AI Summaries
                        </CardTitle>
                        <Brain className="h-5 w-5 text-[#003366]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.aiSummary || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Pending Reviews
                        </CardTitle>
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.pending || 0}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Failed Analyses
                        </CardTitle>
                        <XCircle className="h-5 w-5 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-[#1E1E1E]">
                          {metrics?.failed || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Status Distribution Chart */}
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-[#003366] flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Status Distribution
                        </CardTitle>
                        <CardDescription>
                          Breakdown of proposal statuses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(getStatusChartData).map(
                            ([status, count]) => (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(status)}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#00994C]"
                                      style={{
                                        width: `${
                                          (count / (proposals?.length || 1)) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-[#003366] w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reviewer Load Chart */}
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-[#003366] flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Reviewer Load
                        </CardTitle>
                        <CardDescription>
                          Proposals assigned per reviewer
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getReviewerChartData?.map((reviewer) => (
                            <div
                              key={reviewer.name}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {reviewer.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#003366]"
                                    style={{
                                      width: `${
                                        (reviewer.count / 7500) * 100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-[#003366] w-8 text-right">
                                  {reviewer.count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Proposals Table */}
              {(activeTab === 'dashboard' || activeTab === 'proposals') && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-[#003366]">
                          {currentUser.role === 'reviewer'
                            ? 'My Queue'
                            : 'Proposal Management'}
                        </CardTitle>
                        <CardDescription>
                          {currentUser.role === 'reviewer'
                            ? 'Proposals assigned to you for review'
                            : 'Review and manage all submitted business proposals'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="under-review">
                              Under Review
                            </SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="potential">Potential</SelectItem>
                            <SelectItem value="suggested-approval">
                              Suggested Approval
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* AI Status Filter */}
                        <Select
                          value={aiStatusFilter}
                          onValueChange={setAiStatusFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="AI Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All AI Status</SelectItem>
                            <SelectItem value="idle">Idle</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={grantAmountFilter}
                          onValueChange={setGrantAmountFilter}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Grant Amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Amounts</SelectItem>
                            <SelectItem value="0-1m">₦0 - ₦1M</SelectItem>
                            <SelectItem value="1m-3m">₦1M - ₦3M</SelectItem>
                            <SelectItem value="3m-5m">₦3M - ₦5M</SelectItem>
                            <SelectItem value="5m+">₦5M+</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={mentorshipFilter}
                          onValueChange={setMentorshipFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mentorship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Applicants</SelectItem>
                            <SelectItem value="yes">
                              Wants Mentorship
                            </SelectItem>
                            <SelectItem value="no">No Mentorship</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Reviewer Filter (Admin only) */}
                        {currentUser.role === 'admin' && (
                          <Select
                            value={reviewerFilter}
                            onValueChange={setReviewerFilter}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Reviewer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Reviewers</SelectItem>
                              {filteredReviewers?.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {/* Affiliate Filter (Admin only) */}
                        {currentUser.role === 'admin' && (
                          <Select
                            value={affiliatesFilter}
                            onValueChange={setAffiliatesFilter}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Reviewer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Affiliates
                              </SelectItem>
                              {filteredAffiliates?.map((r) => (
                                <SelectItem key={r.id} value={r.name}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {currentUser.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent"
                            onClick={exportToCSV}
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Unique Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>AI Status</TableHead>
                            <TableHead>AI Score</TableHead>
                            <TableHead>Reviewer</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProposals?.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center py-8 text-gray-500"
                              >
                                No proposals found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProposals?.map((proposal) => (
                              <TableRow key={proposal?.uniqueCode}>
                                <TableCell>{proposal?.fullName}</TableCell>
                                <TableCell className="font-mono text-xs">
                                  {proposal?.uniqueCode}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(proposal?.status)}
                                </TableCell>
                                <TableCell>
                                  {getAIStatusBadge(proposal?.aiStatus)}
                                </TableCell>
                                <TableCell>
                                  {proposal.aiScore ? (
                                    <span className="font-semibold text-[#00994C]">
                                      {proposal?.aiScore}/10
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      0/10
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">
                                    {reviewers?.find(
                                      (r) =>
                                        r.id === proposal.assignedReviewerId
                                    )?.name || 'Unassigned'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600">
                                  {new Date(
                                    proposal.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-white divide-y-2 divide-transparent cursor-default"
                                    >
                                      <DropdownMenuLabel className="mb-1">
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          handleViewProposal(proposal)
                                        }}
                                        className="hover:bg-amber-300 rounded-sm"
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {proposal.fileUrl && (
                                        <DropdownMenuItem
                                          className="hover:bg-amber-300 rounded-sm"
                                          onClick={() =>
                                            downloadFromURL(
                                              proposal.fileUrl,
                                              proposal.fileName
                                            )
                                          }
                                        >
                                          <Download className="mr-2 h-4 w-4" />
                                          Download File
                                        </DropdownMenuItem>
                                      )}
                                      {proposal.status === 'failed' && (
                                        <DropdownMenuItem
                                          className="hover:bg-amber-300 rounded-sm"
                                          onClick={() =>
                                            RetryAI(proposal.uniqueCode)
                                          }
                                        >
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Retry AI Processing
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {currentUser.role === 'admin' && (
                                        <DropdownMenuItem
                                          className="hover:bg-amber-300 rounded-sm"
                                          onClick={() =>
                                            handleOpenReassignModal(proposal)
                                          }
                                        >
                                          <UserPlus className="mr-2 h-4 w-4" />
                                          Reassign Reviewer
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviewer Management Panel */}
              {activeTab === 'reviewers' && currentUser.role === 'admin' && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">
                      Reviewer Management
                    </CardTitle>
                    <CardDescription>
                      Manage reviewer assignments and capacity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reviewers?.map((reviewer) => (
                        <Card key={reviewer.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-[#003366]">
                                {reviewer.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={
                                  reviewer.status === 'available'
                                    ? 'bg-[#00994C]/10 text-[#00994C] border-[#00994C]/30'
                                    : 'bg-orange-50 text-orange-700 border-orange-300'
                                }
                              >
                                {reviewer.status === 'available'
                                  ? 'Available'
                                  : 'At Capacity'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {reviewer?.email || 'null email'}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              Assigned:{' '}
                              <span className="font-semibold text-[#003366]">
                                {reviewer.assignedCount}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00994C]"
                                style={{
                                  width: `${
                                    (reviewer.assignedCount / 7500) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-4 bg-transparent"
                            >
                              View Queue
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Processing Logs */}
              {activeTab === 'ai-logs' && currentUser.role === 'admin' && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#003366]">
                      AI Processing Logs
                    </CardTitle>
                    <CardDescription>
                      View AI analysis history and errors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {proposals
                        ?.filter((p) => p.aiStatus !== 'idle')
                        .map((proposal) => (
                          <div
                            key={proposal.id}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-[#003366]">
                                  {proposal.uniqueCode}
                                </span>
                                {getAIStatusBadge(proposal.aiStatus)}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(proposal.updatedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">
                              {proposal.applicantName}
                            </div>
                            {proposal.aiError && (
                              <Alert className="mt-2 border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800 text-sm">
                                  {proposal.aiError}
                                </AlertDescription>
                              </Alert>
                            )}
                            {proposal.aiScore ? (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">
                                  AI Score:{' '}
                                </span>
                                <span className="font-semibold text-[#00994C]">
                                  {proposal.aiScore}/10
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">
                                  AI Score:{' '}
                                </span>
                                <span className="font-semibold text-[#00994C]">
                                  0/10
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Affiliates */}
              {activeTab === 'affiliates' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Affiliate Management
                    </h1>
                    <p className="text-gray-600">
                      Monitor and manage your affiliate network performance
                    </p>
                  </div>

                  <AffiliateStats />
                  <div className="mt-8">
                    <AffiliateTable />
                  </div>
                </>
              )}
            </main>
          </div>

          {/* Reassign Reviewer Modal */}
          <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
            <DialogContent className="max-w-md h-fit flex">
              <DialogHeader>
                <DialogTitle className="text-[#003366] font-serif">
                  Reassign Reviewer
                </DialogTitle>
                <DialogDescription>
                  Select a reviewer to assign this proposal to
                </DialogDescription>
              </DialogHeader>

              {proposalToReassign && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Proposal</div>
                    <div className="font-semibold text-[#003366]">
                      {proposalToReassign.uniqueCode}
                    </div>
                    <div className="text-sm text-gray-700">
                      {proposalToReassign.fullName}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Reviewer
                    </label>
                    <Select
                      value={selectedReviewerId}
                      onValueChange={setSelectedReviewerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a reviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredReviewers?.map((reviewer) => (
                          <SelectItem key={reviewer.id} value={reviewer.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{reviewer.name}</span>
                              <span className="text-xs text-gray-500 ml-4">
                                ({reviewer.assignedCount} assigned)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowReassignModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmReassign}
                      disabled={!selectedReviewerId}
                      className="bg-[#003366] hover:bg-[#003366]/90"
                    >
                      Confirm Reassignment
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Proposal Detail Modal */}
          <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#003366] font-serif text-2xl">
                  Proposal Details
                </DialogTitle>
                <DialogDescription>
                  {selectedProposal?.uniqueCode} - {selectedProposal?.fullName}
                </DialogDescription>
              </DialogHeader>

              {selectedProposal && (
                <div className="space-y-6 py-4">
                  {/* Applicant Information */}
                  <div className="border-2 border-[#003366]/20 rounded-lg p-5 bg-gradient-to-br from-[#003366]/5 to-transparent">
                    <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Applicant Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-[#00994C] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Full Name
                          </div>
                          <div className="font-semibold text-[#003366]">
                            {selectedProposal.fullName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-[#00994C] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Phone Number
                          </div>
                          <div className="font-semibold text-[#003366]">
                            {selectedProposal.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-[#00994C] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Email Address
                          </div>
                          <div className="font-semibold text-[#003366] text-sm break-all">
                            {selectedProposal.email}
                          </div>
                        </div>
                      </div>

                      {selectedProposal?.affiliateName && (
                        <div className="flex items-start gap-3">
                          <LinkIcon className="w-5 h-5 text-[#00994C] mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Referred By
                            </div>
                            <div className="font-semibold text-[#003366] text-sm break-all">
                              {selectedProposal.affiliateName}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProposal?.affliliateUid && (
                        <div className="flex items-start gap-3">
                          <LinkIcon className="w-5 h-5 text-[#00994C] mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Affiliate Uid
                            </div>
                            <div className="font-semibold text-[#003366] text-sm break-all">
                              {selectedProposal.affiliateUid}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProposal?.referralCode && (
                        <div className="flex items-start gap-3">
                          <LinkIcon className="w-5 h-5 text-[#00994C] mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Referral Code
                            </div>
                            <div className="font-semibold text-[#003366] text-sm break-all">
                              {selectedProposal.referralCode}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="border-2 border-[#00994C]/20 rounded-lg p-5 bg-gradient-to-br from-[#00994C]/5 to-transparent">
                    <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Business Name
                          </div>
                          <div className="font-semibold text-[#003366]">
                            {selectedProposal.businessName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Business Type
                          </div>
                          <div className="font-semibold text-[#003366]">
                            {selectedProposal.businessType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Location
                          </div>
                          <div className="font-semibold text-[#003366]">
                            {selectedProposal.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-[#00994C]/20">
                      <div className="text-xs text-gray-600 mb-2">
                        Business Description
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedProposal.businessDescription}
                      </p>
                    </div>
                  </div>

                  {/* Grant Details */}
                  <div className="border-2 border-[#FFB800]/30 rounded-lg p-5 bg-gradient-to-br from-[#FFB800]/5 to-transparent">
                    <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Grant Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-[#FFB800] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Grant Amount Requested
                          </div>
                          <div className="text-2xl font-bold text-[#003366]">
                            {selectedProposal.grantAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-[#FFB800] mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Mentorship Program
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              selectedProposal.wantsMentorship
                                ? 'bg-[#00994C]/10 text-[#00994C] border-[#00994C]/30'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }
                          >
                            {selectedProposal.wantsMentorship
                              ? 'Yes, Interested'
                              : 'No, Not Needed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-[#FFB800]/20">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-[#FFB800] mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 mb-2">
                            Grant Purpose
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedProposal.grantPurpose}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and AI Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Status</div>
                      {getStatusBadge(selectedProposal.status)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        AI Status
                      </div>
                      {getAIStatusBadge(selectedProposal.aiStatus)}
                    </div>
                  </div>

                  {/* AI Summary */}
                  {selectedProposal.aiSummary && (
                    <div className="p-4 bg-[#F5F5F5] rounded-lg border-l-4 border-[#00994C] hover:-translate-y-1 transition-all duration-300 ease-in">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-[#003366]" />
                        <h4 className="font-semibold text-[#003366]">
                          AI-Generated Summary
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {selectedProposal.aiSummary}
                      </p>
                      {selectedProposal.aiScore && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">
                            AI Score:
                          </span>
                          <span className="text-2xl font-bold text-[#00994C]">
                            {selectedProposal.aiScore}
                          </span>
                          <span className="text-sm text-gray-500">/ 10</span>
                          <div className="flex-1 ml-4">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00994C]"
                                style={{
                                  width: `${
                                    (selectedProposal.aiScore / 10) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Notes */}
                  <div className="flex flex-col gap-2 p-4 bg-[#F5F5F5] rounded-lg border-l-4 border-amber-300 hover:-translate-y-1 transition-all duration-300 ease-in">
                    <h4 className="font-semibold text-[#003366] flex items-center gap-2">
                      <FileText className="h-4 w-4" /> AI Notes
                    </h4>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {selectedProposal.aiNotes || 'No AI notes available'}
                    </span>
                  </div>

                  {/* AI Error */}
                  {selectedProposal.aiError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {selectedProposal.aiError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* File Info */}
                  {selectedProposal.fileUrl && (
                    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-300/40 transition-colors duration-300 ease-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#003366]" />
                          <div>
                            <div className="font-medium text-[#003366]">
                              {selectedProposal?.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Uploaded:{' '}
                              {new Date(
                                selectedProposal?.createdAt
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent hover:bg-green-400/60"
                          onClick={() =>
                            downloadFromURL(
                              selectedProposal.fileUrl,
                              selectedProposal.fileName
                            )
                          }
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Change - Reviewer */}
                  {currentUser?.role === 'reviewer' &&
                    !['processing', 'pending', 'failed'].includes(
                      selectedProposal.status
                    ) && (
                      <div className="p-4 border-2 rounded-lg border-[#00994C]/30 bg-[#00994C]/5">
                        <h4 className="font-semibold text-[#003366] mb-3">
                          Update Status (Reviewer)
                        </h4>
                        <div className="flex items-center gap-3">
                          <Select
                            value={selectedProposal.status}
                            onValueChange={(value) => {
                              handleChangeStatus(
                                selectedProposal.uniqueCode,
                                value
                              )
                            }}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="potential">
                                Potential
                              </SelectItem>
                              <SelectItem value="suggested-approval">
                                Suggested Approval
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          As a reviewer, you can recommend status changes and
                          Reject. Only admins can give final approval.
                        </p>
                      </div>
                    )}

                  {/* Status Change - Admin */}
                  {currentUser?.role === 'admin' &&
                    !['processing', 'pending', 'failed'].includes(
                      selectedProposal.status
                    ) && (
                      <div className="p-4 border-2 border-[#FFB800]/30 bg-[#FFB800]/5 rounded-lg">
                        <h4 className="font-semibold text-[#003366] mb-3">
                          Change Status (Admin Only)
                        </h4>
                        <div className="flex items-center gap-3">
                          <Select
                            value={selectedProposal.status}
                            onValueChange={(value) =>
                              handleChangeStatus(
                                selectedProposal.uniqueCode,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under-review">
                                Under Review
                              </SelectItem>
                              <SelectItem value="approved">
                                Approved (final)
                              </SelectItem>
                              <SelectItem value="suggested-approval">
                                Suggested Approval
                              </SelectItem>
                              <SelectItem value="potential">
                                Potential
                              </SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          {selectedProposal.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                RetryAI(selectedProposal.uniqueCode)
                              }
                              className="gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Retry AI Processing
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Note: Final approval/rejection can only be set by
                          admins. All status changes are logged.
                        </p>
                      </div>
                    )}

                  {/* Comments Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-[#003366]" />
                      <h4 className="font-semibold text-[#003366]">Comments</h4>
                      <Badge variant="outline" className="text-xs">
                        Private to author & admins
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {getVisibleComments(selectedProposal.id).length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No comments yet
                        </div>
                      ) : (
                        getVisibleComments(selectedProposal.id).map(
                          (comment) => (
                            <div
                              key={comment.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-[#003366]">
                                    {comment.authorName}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {comment.authorRole}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {comment.content}
                              </p>
                            </div>
                          )
                        )
                      )}
                    </div>

                    {/* Add Comment */}
                    {(currentUser.role === 'admin' ||
                      (currentUser.role === 'reviewer' &&
                        selectedProposal.assignedReviewerId ===
                          currentUser.id)) && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a comment (visible only to you and admins)..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          rows={3}
                        />
                        <Button
                          onClick={() => handleAddComment(selectedProposal.id)}
                          disabled={!newComment.trim()}
                          className="bg-[#003366] hover:bg-[#003366]/90"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Activity Log */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-[#003366]" />
                      <h4 className="font-semibold text-[#003366]">
                        Activity Log
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {activities && activities.length > 0 ? (
                        activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 text-sm"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#00994C] mt-1.5"></div>
                            <div className="flex-1">
                              <span className="text-gray-700">
                                <span className="font-medium text-[#003366]">
                                  {activity.actorName}
                                </span>{' '}
                                {activity.action}
                              </span>
                              {activity.from && activity.to && (
                                <span className="text-gray-600">
                                  {' '}
                                  from{' '}
                                  <span className="font-medium">
                                    {activity.from}
                                  </span>{' '}
                                  to{' '}
                                  <span className="font-medium">
                                    {activity.to}
                                  </span>
                                </span>
                              )}
                              <div className="text-xs text-gray-500 mt-0.5">
                                {activity.createdAt?.toDate
                                  ? new Date(
                                      activity.createdAt.toDate()
                                    ).toLocaleString()
                                  : new Date(
                                      activity.createdAt
                                    ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No activity logged yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowProposalModal(false)}
                    >
                      Close
                    </Button>
                    {selectedProposal?.fileUrl && (
                      <Button
                        className="bg-[#003366] hover:bg-[#003366]/90 gap-2"
                        onClick={() => setOpenFile((prev) => !prev)}
                      >
                        <Eye className="w-4 h-4" />
                        View Full Proposal
                      </Button>
                    )}
                  </div>
                  {openFile && (
                    <DocumentViewer
                      url={selectedProposal.fileUrl}
                      title={selectedProposal.title}
                    />
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Broadcast Modal */}
          <Dialog
            open={showBroadcastModal}
            onOpenChange={setShowBroadcastModal}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Broadcast Message</DialogTitle>
                <DialogDescription>
                  Send a notification to all users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowBroadcastModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendBroadcast}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}
