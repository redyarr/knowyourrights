"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Briefcase,
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Send,
  UserCheck,
  CheckCircle,
  FileText,
  Clock,
  ChevronRight,
  X,
  Trash2,
  DollarSign,
  AlertCircle,
  Filter,
} from "lucide-react"

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Selected Job Details
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false)
  const [jobDetails, setJobDetails] = useState(null)

  // Modals / Input States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    summary: "",
    country: "",
    city: "",
    category: "Civil Rights",
    budget: "$1,500 - $3,000",
    urgency: "Standard",
  })
  const [applyMessage, setApplyMessage] = useState("")
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUserData()
    fetchJobs()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/getuserdata")
      const data = await response.json()
      if (data.success) {
        setUserData(data.payload)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/jobs", {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs || [])
      } else {
        toast.error(data.error || "Failed to load jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Network error while loading jobs")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobDetails = async (jobId) => {
    setJobDetailsLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/jobs/${jobId}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setJobDetails(data)
      } else {
        toast.error(data.error || "Failed to load job details")
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast.error("Network error loading job details")
    } finally {
      setJobDetailsLoading(false)
    }
  }

  const handleSelectJob = (job) => {
    setSelectedJob(job)
    fetchJobDetails(job.id)
  }

  // Parse metadata embedded in descriptions
  const parseJobMetadata = (summary) => {
    const metaRegex = /--- Category: (.*?) \| Budget: (.*?) \| Urgency: (.*?) ---/
    const match = summary.match(metaRegex)
    if (match) {
      const cleanSummary = summary.replace(metaRegex, "").trim()
      return {
        cleanSummary,
        category: match[1],
        budget: match[2],
        urgency: match[3],
      }
    }
    // Fallback defaults for legacy description strings
    return {
      cleanSummary: summary,
      category: "General Legal",
      budget: "$500 - $1,500",
      urgency: "Standard",
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!newJob.summary || !newJob.country || !newJob.city) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    // Embed metadata inside description
    const formattedSummary = `${newJob.summary}\n\n--- Category: ${newJob.category} | Budget: ${newJob.budget} | Urgency: ${newJob.urgency} ---`

    try {
      const response = await fetch("http://localhost:3001/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          summary: formattedSummary,
          country: newJob.country,
          city: newJob.city,
        }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Job posted successfully!")
        setIsCreateOpen(false)
        setNewJob({
          summary: "",
          country: "",
          city: "",
          category: "Civil Rights",
          budget: "$1,500 - $3,000",
          urgency: "Standard",
        })
        fetchJobs()
      } else {
        toast.error(data.error || "Failed to create job")
      }
    } catch (error) {
      console.error("Error creating job:", error)
      toast.error("Network error while posting job")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!applyMessage.trim()) {
      toast.error("Please provide a cover message")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:3001/jobs/${selectedJob.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: applyMessage }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Application submitted successfully!")
        setIsApplyOpen(false)
        setApplyMessage("")
        fetchJobDetails(selectedJob.id)
      } else {
        toast.error(data.error || "Failed to apply")
      }
    } catch (error) {
      console.error("Error applying:", error)
      toast.error("Network error while applying")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptLawyer = async (applicationId) => {
    try {
      const response = await fetch(`http://localhost:3001/jobs/${selectedJob.id}/accept/${applicationId}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Lawyer accepted! A conversation has been initiated.")
        fetchJobDetails(selectedJob.id)
      } else {
        toast.error(data.error || "Failed to accept lawyer")
      }
    } catch (error) {
      console.error("Error accepting lawyer:", error)
      toast.error("Network error while accepting lawyer")
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    try {
      const response = await fetch(`http://localhost:3001/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Job posting deleted")
        setSelectedJob(null)
        setJobDetails(null)
        fetchJobs()
      } else {
        toast.error(data.error || "Failed to delete job")
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Network error while deleting job")
    }
  }

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const meta = parseJobMetadata(job.summary)
    const matchesSearch = meta.cleanSummary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = countryFilter ? job.country.toLowerCase().includes(countryFilter.toLowerCase()) : true
    const matchesCity = cityFilter ? job.city.toLowerCase().includes(cityFilter.toLowerCase()) : true
    const matchesCategory = categoryFilter === "all" ? true : meta.category === categoryFilter
    return matchesSearch && matchesCountry && matchesCity && matchesCategory
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 text-white py-12 px-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Legal Jobs & Cases</h1>
            <p className="text-blue-100 mt-2 max-w-xl">
              Post legal cases to find verified advocates, or apply for client postings as a licensed professional.
            </p>
          </div>

          {userData?.userType !== "lawyer" && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold shadow-lg transition transform hover:-translate-y-0.5">
                  <Plus className="mr-2 h-5 w-5 text-indigo-600" /> Post a Case
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreateJob}>
                  <DialogHeader>
                    <DialogTitle>Post a New Case</DialogTitle>
                    <DialogDescription>
                      Describe your legal need so verified attorneys can review and apply.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="summary">Case Details & Summary</Label>
                      <Textarea
                        id="summary"
                        placeholder="Explain your case, issues, and goals in detail..."
                        rows={4}
                        value={newJob.summary}
                        onChange={(e) => setNewJob({ ...newJob, summary: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="e.g. United States"
                          value={newJob.country}
                          onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="e.g. New York"
                          value={newJob.city}
                          onChange={(e) => setNewJob({ ...newJob, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={newJob.category}
                          onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                        >
                          <option value="Civil Rights">Civil Rights</option>
                          <option value="Corporate Law">Corporate Law</option>
                          <option value="Family Law">Family Law</option>
                          <option value="Criminal Law">Criminal Law</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="budget">Budget Range</Label>
                        <select
                          id="budget"
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={newJob.budget}
                          onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                        >
                          <option value="$500 - $1,500">$500 - $1.5k</option>
                          <option value="$1,500 - $3,000">$1.5k - $3k</option>
                          <option value="$3,000 - $6,000">$3k - $6k</option>
                          <option value="$6,000+">$6k+</option>
                          <option value="Hourly Rate">Hourly Rate</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="urgency">Urgency</Label>
                        <select
                          id="urgency"
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={newJob.urgency}
                          onChange={(e) => setNewJob({ ...newJob, urgency: e.target.value })}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Immediate">Immediate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={submitting}>
                      {submitting ? "Posting..." : "Post Case"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Search & Filters Card */}
        <Card className="mb-8 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-md">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search case descriptions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Country"
                className="pl-9"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by City"
                className="pl-9"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Chip Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            className="rounded-full h-8 text-xs font-semibold shrink-0"
            onClick={() => setCategoryFilter("all")}
          >
            All Categories
          </Button>
          {["Civil Rights", "Corporate Law", "Family Law", "Criminal Law", "Other"].map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              className="rounded-full h-8 text-xs font-semibold shrink-0"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Content Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Available Cases ({filteredJobs.length})
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-20 bg-slate-100 dark:bg-slate-800" />
                    <CardContent className="h-12 bg-slate-50 dark:bg-slate-900" />
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <CardContent className="flex flex-col items-center justify-center">
                  <Briefcase className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="font-semibold text-lg">No cases found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mt-1">
                    Try altering your search text or location filters. If you need help, you can post a new case.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const meta = parseJobMetadata(job.summary)
                  const isSelected = selectedJob?.id === job.id

                  return (
                    <Card
                      key={job.id}
                      className={`cursor-pointer transition-all duration-200 border hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/20 dark:border-blue-600 dark:bg-blue-950/25"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      }`}
                      onClick={() => handleSelectJob(job)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-semibold border-0 text-[10px]">
                                {meta.category}
                              </Badge>
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-semibold border-0 text-[10px] flex items-center gap-0.5">
                                <DollarSign className="h-2.5 w-2.5" /> {meta.budget}
                              </Badge>
                              {meta.urgency !== "Standard" && (
                                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-semibold border-0 text-[10px] flex items-center gap-0.5 animate-pulse">
                                  <AlertCircle className="h-2.5 w-2.5" /> {meta.urgency}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2">
                              {meta.cleanSummary}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {job.city}, {job.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Details Sidebar Panel */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <Card className="sticky top-20 border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 w-full"></div>
                <CardHeader className="pb-3 relative">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      Case Detail
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      onClick={() => setSelectedJob(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedJob.city}, {selectedJob.country}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Metadata display */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Budget Range</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        {parseJobMetadata(selectedJob.summary).budget}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Urgency Level</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                        {parseJobMetadata(selectedJob.summary).urgency}
                      </span>
                    </div>
                  </div>

                  {/* Case Text */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description Summary</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border">
                      {parseJobMetadata(selectedJob.summary).cleanSummary}
                    </p>
                  </div>

                  <Separator />

                  {/* Actions & Applicant details */}
                  {jobDetailsLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Clock className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading details...</span>
                    </div>
                  ) : jobDetails ? (
                    <div className="space-y-6">
                      {/* Author Deletion Option */}
                      {jobDetails.isAuthor && (
                        <div className="flex justify-between items-center bg-red-50/50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                          <span className="text-xs text-red-700 dark:text-red-400 font-medium">Author Settings</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 font-semibold"
                            onClick={() => handleDeleteJob(selectedJob.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Posting
                          </Button>
                        </div>
                      )}

                      {/* Lawyer Applying Option */}
                      {userData?.userType === "lawyer" && !jobDetails.isAuthor && (
                        <div>
                          {jobDetails.hasApplied ? (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                              <span className="text-sm font-semibold">Application Submitted</span>
                            </div>
                          ) : (
                            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                              <DialogTrigger asChild>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
                                  <Send className="mr-2 h-4 w-4" /> Apply for Case
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <form onSubmit={handleApply}>
                                  <DialogHeader>
                                    <DialogTitle>Apply to Case</DialogTitle>
                                    <DialogDescription>
                                      Send a message to the client outlining your qualifications, legal advice, and how you can help.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Label htmlFor="message">Application Message</Label>
                                    <Textarea
                                      id="message"
                                      placeholder="Dear client, I am a verified attorney specializing in..."
                                      rows={5}
                                      value={applyMessage}
                                      onChange={(e) => setApplyMessage(e.target.value)}
                                      required
                                      className="mt-2"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={submitting}>
                                      {submitting ? "Submitting..." : "Send Application"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}

                      {/* Author View: List of Applicants */}
                      {jobDetails.isAuthor && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Applicants ({jobDetails.applicants?.length || 0})
                          </h4>

                          {(!jobDetails.applicants || jobDetails.applicants.length === 0) ? (
                            <p className="text-xs text-muted-foreground text-center py-4 bg-slate-50 dark:bg-slate-950 rounded border border-dashed">
                              No attorneys have applied to your post yet.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {jobDetails.applicants.map((app) => (
                                <div key={app.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={app.user?.profileImage} />
                                        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                                          {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                          {app.user?.firstName} {app.user?.lastName}
                                        </h5>
                                        <span className="text-[10px] text-muted-foreground">Attorney</span>
                                      </div>
                                    </div>
                                    
                                    {app.status === "accepted" ? (
                                      <Badge className="bg-emerald-600 text-white text-[10px] flex items-center gap-1">
                                        <UserCheck className="h-3 w-3" /> Hired
                                      </Badge>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[10px] font-semibold border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                        onClick={() => handleAcceptLawyer(app.id)}
                                      >
                                        Accept & Chat
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded border leading-relaxed">
                                    {app.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-20 border-dashed py-16 text-center text-slate-400">
                <CardContent className="flex flex-col items-center justify-center">
                  <Briefcase className="h-10 w-10 text-slate-300 mb-3 animate-bounce" />
                  <p className="text-sm font-semibold">Select a Case</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                    Select a case from the list on the left to see full details and applicant listings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
