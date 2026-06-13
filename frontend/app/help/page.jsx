"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  FileText,
  Mail,
  Scale,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"

const FAQ_DATA = [
  {
    category: "verification",
    question: "How do I verify my lawyer profile?",
    answer: "To verify your lawyer profile, navigate to Edit Profile, fill out your License Number, State Bar, and Badge Issuing Authority, and upload your credential document. An administrator will review your submission and approve it within 24-48 hours.",
  },
  {
    category: "verification",
    question: "What happens if my verification is rejected?",
    answer: "If your verification is rejected, the administrator will provide a reason. You will receive a notification outlining the specific issue. You can modify your profile data and submit it again for approval.",
  },
  {
    category: "networking",
    question: "How do connections work?",
    answer: "You can send connection requests to other users. Once they accept your connection request, you can see their full profile details and start messaging. You can manage pending connections on the Network page.",
  },
  {
    category: "jobs",
    question: "Can I post a case anonymously?",
    answer: "Yes, clients can check the 'Anonymous Posting' option in Settings to hide their name from public job listings. Only accepted attorneys will see the client's information.",
  },
  {
    category: "jobs",
    question: "How do I hire an attorney for my posted case?",
    answer: "Go to the Job Board, select your posted case, and view the list of applicants. Review their messages, and click the 'Accept & Chat' button. This accepts their bid and initiates a conversation.",
  },
  {
    category: "premium",
    question: "What are the benefits of Premium membership?",
    answer: "Premium membership gives attorneys a prominent badge on search results, unlimited connection requests, priority listings, and advanced search filters. For clients, it offers priority legal consults.",
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ticketState, setTicketState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submittingTicket, setSubmittingTicket] = useState(false)

  const handleTicketSubmit = (e) => {
    e.preventDefault()
    if (!ticketState.name || !ticketState.email || !ticketState.subject || !ticketState.message) {
      toast.error("Please fill in all support fields")
      return
    }

    setSubmittingTicket(true)
    setTimeout(() => {
      toast.success("Support ticket created! We will reply to your email shortly.")
      setTicketState({ name: "", email: "", subject: "", message: "" })
      setSubmittingTicket(false)
    }, 1500)
  }

  // Filter FAQs
  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "all" ? true : faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <HelpCircle className="h-12 w-12 mx-auto text-blue-200 mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Help & Support Center</h1>
          <p className="text-blue-100 mt-2 max-w-xl mx-auto">
            Find answers to frequently asked questions, or reach out to our dedicated support representatives.
          </p>

          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search help articles..."
              className="pl-10 h-11 bg-white text-slate-900 focus-visible:ring-1 border-0 rounded-xl shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - FAQ directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Topics" },
              { id: "verification", label: "Verification" },
              { id: "networking", label: "Networking" },
              { id: "jobs", label: "Cases & Jobs" },
              { id: "premium", label: "Premium Upgrade" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className="rounded-full h-8 px-4 text-xs font-semibold shrink-0"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card className="text-center py-10 border-dashed">
                <CardContent>
                  <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No results match your criteria</p>
                  <p className="text-xs text-muted-foreground mt-1">Try changing your search terms or filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq, index) => (
                <Card key={index} className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-extrabold flex items-start gap-2 leading-tight">
                      <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div>
          <Card className="border-slate-200 dark:border-slate-800 sticky top-20 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Submit a Ticket
              </CardTitle>
              <CardDescription>
                Can't find the answer you need? Send a direct request to our staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="supportName">Your Name</Label>
                  <Input
                    id="supportName"
                    placeholder="e.g. John Doe"
                    required
                    value={ticketState.name}
                    onChange={(e) => setTicketState({ ...ticketState, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="supportEmail">Your Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={ticketState.email}
                    onChange={(e) => setTicketState({ ...ticketState, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="supportSubject">Subject</Label>
                  <Input
                    id="supportSubject"
                    placeholder="e.g. Account issue"
                    required
                    value={ticketState.subject}
                    onChange={(e) => setTicketState({ ...ticketState, subject: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="supportMessage">Message Description</Label>
                  <Textarea
                    id="supportMessage"
                    placeholder="Explain your problem in detail..."
                    rows={4}
                    required
                    value={ticketState.message}
                    onChange={(e) => setTicketState({ ...ticketState, message: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={submittingTicket}>
                  {submittingTicket ? "Submitting..." : "Send Request"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
