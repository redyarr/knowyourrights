"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Hash,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

const INITIAL_GROUPS = [
  {
    id: 1,
    name: "Civil Rights & Liberties Association",
    category: "constitutional",
    description: "Discussing ongoing civil rights litigation, free expression, privacy protections, and constitutional law changes.",
    members: 1420,
    postsThisWeek: 34,
    joined: false,
    discussions: [
      { sender: "Eleanor Vance, Esq.", message: "Has anyone analyzed the Supreme Court's latest ruling on digital privacy?" },
      { sender: "Arthur Pendelton", message: "Yes! It seems like a huge win for consumer data protection regulations." },
    ]
  },
  {
    id: 2,
    name: "Corporate Counsel Roundtable",
    category: "corporate",
    description: "A secure community for corporate attorneys to debate M&A laws, regulatory compliance, IP protections, and governance.",
    members: 890,
    postsThisWeek: 18,
    joined: true,
    discussions: [
      { sender: "Douglas Sterling", message: "Is anyone updating their merger documents for the Q3 regulatory shifts?" },
      { sender: "Rebecca Sharp", message: "We just finished revising ours. I can share the non-sensitive templates." },
    ]
  },
  {
    id: 3,
    name: "Family Law Practitioners Forum",
    category: "family",
    description: "Covers divorce procedures, custody matters, inheritance law, guardianship disputes, and client communication practices.",
    members: 1105,
    postsThisWeek: 22,
    joined: false,
    discussions: [
      { sender: "Sarah Jenkins", message: "How do you handle mediation when one party refuses to disclose foreign assets?" },
      { sender: "Timothy Gage", message: "File for a formal asset disclosure order immediately. Don't waste time on mediation." },
    ]
  },
  {
    id: 4,
    name: "Criminal Defense League",
    category: "criminal",
    description: "A forum to discuss criminal defense strategies, evidence admissibility, trial tactics, and sentencing guidelines.",
    members: 670,
    postsThisWeek: 15,
    joined: false,
    discussions: [
      { sender: "Harvey Dent, Esq.", message: "What are your thoughts on the new admissibility guidelines for digital forensics?" },
    ]
  },
  {
    id: 5,
    name: "Environmental Advocacy Network",
    category: "constitutional",
    description: "For lawyers and advocates focusing on climate regulations, conservation litigation, and clean energy compliance laws.",
    members: 530,
    postsThisWeek: 9,
    joined: false,
    discussions: [
      { sender: "Julia Carson", message: "Does anyone have templates for environmental impact statement objections?" },
    ]
  },
]

export default function GroupsPage() {
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  // Preview State
  const [previewGroup, setPreviewGroup] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Creation modal states
  const [isOpen, setIsOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: "", category: "constitutional", description: "" })
  const [submitting, setSubmitting] = useState(false)

  const handleJoinToggle = (groupId) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          const nextState = !group.joined
          toast.success(nextState ? `Joined ${group.name}!` : `Left ${group.name}`)
          return {
            ...group,
            joined: nextState,
            members: nextState ? group.members + 1 : group.members - 1,
          }
        }
        return group
      })
    )
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!newGroup.name || !newGroup.description) {
      toast.error("Please fill in all details")
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const addedGroup = {
        id: groups.length + 1,
        name: newGroup.name,
        category: newGroup.category,
        description: newGroup.description,
        members: 1,
        postsThisWeek: 0,
        joined: true,
        discussions: [],
      }
      setGroups((prev) => [addedGroup, ...prev])
      toast.success(`Community "${newGroup.name}" created successfully!`)
      setNewGroup({ name: "", category: "constitutional", description: "" })
      setIsOpen(false)
      setSubmitting(false)
    }, 1200)
  }

  const handleOpenPreview = (group) => {
    setPreviewGroup(group)
    setIsPreviewOpen(true)
  }

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    const matchesCategory = selectedCategory === "all" ? true : group.category === selectedCategory
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          group.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const trendingTags = [
    "#DataPrivacyRulings",
    "#CorporateCompliance2026",
    "#FamilyMediationTips",
    "#DigitalForensicsDefense",
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Legal Communities & Groups</h1>
            <p className="text-blue-100 mt-2 max-w-xl">
              Join legal interest groups to engage in secure discussions, share insights, and discuss recent legal reforms.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Start a Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleCreateGroup}>
                <DialogHeader>
                  <DialogTitle>Create Discussion Group</DialogTitle>
                  <DialogDescription>
                    Establish a new community dedicated to specific legal questions or sectors.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g. Environmental Litigators Forum"
                      required
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="groupCategory">Category</Label>
                    <select
                      id="groupCategory"
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                    >
                      <option value="constitutional">Constitutional & Civil Rights</option>
                      <option value="corporate">Corporate & Securities</option>
                      <option value="family">Family & Probate</option>
                      <option value="criminal">Criminal Defense</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="groupDesc">Description</Label>
                    <Textarea
                      id="groupDesc"
                      placeholder="Explain the purpose of this group and who it is for..."
                      rows={4}
                      required
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: Categories & Hashtags */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">Categories</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "all", label: "All Categories" },
                { id: "constitutional", label: "Civil Rights" },
                { id: "corporate", label: "Corporate Law" },
                { id: "family", label: "Family Law" },
                { id: "criminal", label: "Criminal Defense" },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "ghost"}
                  className="justify-start h-8 text-xs font-semibold"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600 animate-pulse" /> Trending Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-medium py-1 px-2.5 transition"
                  onClick={() => {
                    setSearchQuery(tag.substring(1))
                    toast.info(`Filtering by ${tag}`)
                  }}
                >
                  <Hash className="h-2.5 w-2.5 mr-0.5 text-blue-500" />
                  {tag.substring(1)}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Search & Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search legal groups by name or topic..."
              className="pl-9 h-10 bg-white dark:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 border border-dashed rounded-lg bg-white dark:bg-slate-900">
                <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <h3 className="font-semibold text-lg">No communities found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  No groups matched your search. You can click 'Start a Group' above to create a new legal interest board.
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition duration-200 flex flex-col justify-between"
                >
                  <div className="cursor-pointer" onClick={() => handleOpenPreview(group)}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {group.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {group.members.toLocaleString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 hover:text-blue-600 transition">
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {group.description}
                      </p>
                    </CardContent>
                  </div>

                  <div>
                    <Separator />
                    <CardFooter className="p-4 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" /> {group.postsThisWeek} posts this week
                      </span>
                      <Button
                        size="sm"
                        variant={group.joined ? "secondary" : "default"}
                        className="h-8 text-xs font-semibold"
                        onClick={() => handleJoinToggle(group.id)}
                      >
                        {group.joined ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Joined
                          </>
                        ) : (
                          "Join Community"
                        )}
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Discussion Preview Dialog */}
      {previewGroup && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {previewGroup.name}
              </DialogTitle>
              <DialogDescription>
                Preview the discussions inside this community interest group.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded border">
                {previewGroup.description}
              </p>

              <Separator />

              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Board Feed</h4>
                {(!previewGroup.discussions || previewGroup.discussions.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No recent messages. Start the conversation!</p>
                ) : (
                  previewGroup.discussions.map((disc, idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-indigo-600 text-white text-[8px]">
                            {disc.sender[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{disc.sender}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{disc.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                onClick={() => {
                  handleJoinToggle(previewGroup.id)
                  setIsPreviewOpen(false)
                }}
              >
                {previewGroup.joined ? "Leave Group" : "Join to Discuss"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
