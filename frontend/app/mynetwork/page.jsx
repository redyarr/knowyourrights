"use client"

import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Input } from "../../components/ui/input"
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  X, 
  Clock, 
  Check,
  Search,
  ShieldCheck,
  GraduationCap,
  MessageCircle,
  UserX,
  Compass,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

const MyNetworkPage = () => {
  const [networkData, setNetworkData] = useState({
    connectionRequests: [],
    pendingRequests: [],
    friends: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')
  const [searchQuery, setSearchQuery] = useState('')
  const [processingRequest, setProcessingRequest] = useState(null)

  useEffect(() => {
    fetchNetworkData()
  }, [])

  const fetchNetworkData = async () => {
    try {
      const response = await fetch('http://localhost:3001/mynetwork/', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Network data received:', data)
      
      if (data.success) {
        // Map the backend data structure to our expected format
        const mappedData = {
          connectionRequests: data.data.receivedRequests || [],
          pendingRequests: data.data.pendingRequests || [],
          friends: data.data.connections || []
        }
        setNetworkData(mappedData)
      } else {
        toast.error(data.message || "Failed to load network data")
      }
    } catch (error) {
      console.error('Error fetching network data:', error)
      toast.error("Failed to load your network. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionRequest = async (requestId, action) => {
    if (processingRequest === requestId) return
    
    setProcessingRequest(requestId)
    
    try {
      let url
      
      switch (action) {
        case 'accept':
          url = `http://localhost:3001/mynetwork/accept/${requestId}`
          break
        case 'decline':
          url = `http://localhost:3001/mynetwork/decline/${requestId}`
          break
        case 'cancel':
          url = `http://localhost:3001/mynetwork/cancel/${requestId}`
          break
        default:
          throw new Error('Invalid action')
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Request ${action}ed successfully`)
        // Refresh network data
        await fetchNetworkData()
      } else {
        toast.error(data.message || "Please try again")
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast.error("Failed to process request. Please try again.")
    } finally {
      setProcessingRequest(null)
    }
  }

  const getUserInitials = (user) => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User'
    return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }

  const getLawyerAuthority = (authority) => {
    switch (authority) {
      case 'approved':
        return {
          label: 'Verified Advocate',
          icon: ShieldCheck,
          color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/30'
        }
      case 'consultant':
        return {
          label: 'Consultant',
          icon: Clock,
          color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/30'
        }
      case 'training':
        return {
          label: 'Academic Trainee',
          icon: GraduationCap,
          color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/30'
        }
      default:
        return {
          label: 'Verified Lawyer',
          icon: ShieldCheck,
          color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/30'
        }
    }
  }

  const filterItems = (items, searchKey) => {
    if (!searchQuery) return items
    return items.filter(item => {
      const user = item[searchKey]
      const name = getUserDisplayName(user).toLowerCase()
      const firm = (user.lawyer?.lawFirm)?.toLowerCase() || ''
      return name.includes(searchQuery.toLowerCase()) || firm.includes(searchQuery.toLowerCase())
    })
  }

  const filteredRequests = filterItems(networkData.connectionRequests || [], 'requester')
  const filteredPending = filterItems(networkData.pendingRequests || [], 'receiver')
  const filteredConnections = filterItems(networkData.friends || [], 'connectedUser')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted/20 border-slate-200 dark:border-slate-800"></Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white py-10 px-4 shadow-md relative overflow-hidden">
        <div className="absolute top-[-40%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-400" /> Professional Network
            </h1>
            <p className="text-slate-300 mt-2 text-sm max-w-xl">
              Connect with verify-credentialed lawyers and legal advisors. Build relationships that advance counsel and representation.
            </p>
          </div>
          
          {/* Search bar inside header */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or firm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="space-y-6">
          {/* Custom Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800/80 gap-6">
            {[
              { id: 'requests', label: 'Received', count: filteredRequests.length },
              { id: 'pending', label: 'Sent / Pending', count: filteredPending.length },
              { id: 'connections', label: 'Connections', count: filteredConnections.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-bold text-sm transition-all flex items-center gap-2 relative ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                <Badge variant={activeTab === tab.id ? 'default' : 'secondary'} className="text-[10px] py-0.5 px-2 font-extrabold rounded-full">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="min-h-[400px]">
            {/* Received Requests */}
            {activeTab === 'requests' && (
              <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-base font-bold">Received Invites</CardTitle>
                  <CardDescription className="text-xs">Members who requested to join your professional network circle.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredRequests.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {searchQuery ? 'No matched invites' : 'No pending invitations'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {searchQuery 
                          ? 'Try modifying your search criteria'
                          : 'You do not have any incoming network connections at the moment.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredRequests.map((request) => {
                      const user = request.requester
                      const authority = user.lawyer ? getLawyerAuthority(user.lawyer.badgeIssuingAuthority) : null
                      
                      return (
                        <div key={request.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Link href={`/in/${user.id}`}>
                              <Avatar className="h-10 w-10 border border-slate-200/50 dark:border-slate-800 cursor-pointer hover:opacity-90">
                                <AvatarImage src={user.ProfileImage?.imagePath} alt={getUserDisplayName(user)} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Link href={`/in/${user.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition">
                                  {getUserDisplayName(user)}
                                </Link>
                                {authority && (
                                  <Badge className={`text-[9px] font-extrabold px-1.5 py-0.5 border ${authority.color}`}>
                                    <authority.icon className="h-2.5 w-2.5 mr-0.5" />
                                    {authority.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                                {user.lawyer?.lawFirm ? `@ ${user.lawyer.lawFirm}` : 'Client Member'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 h-8 shadow-sm"
                              onClick={() => handleConnectionRequest(request.id, 'accept')}
                              disabled={processingRequest === request.id}
                            >
                              {processingRequest === request.id ? 'Processing...' : (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3.5 w-3.5" /> Accept
                                </span>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-200 dark:border-slate-800 text-xs font-bold px-3.5 h-8 hover:bg-slate-50 dark:hover:bg-slate-800"
                              onClick={() => handleConnectionRequest(request.id, 'decline')}
                              disabled={processingRequest === request.id}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Decline
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sent / Pending Requests */}
            {activeTab === 'pending' && (
              <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-base font-bold">Sent Invitations</CardTitle>
                  <CardDescription className="text-xs">Pending connection requests awaiting receiver verification.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredPending.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <UserX className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {searchQuery ? 'No matched pending invites' : 'No outgoing pending invites'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        You have not sent any pending invitations at this time.
                      </p>
                    </div>
                  ) : (
                    filteredPending.map((request) => {
                      const user = request.receiver
                      const authority = user.lawyer ? getLawyerAuthority(user.lawyer.badgeIssuingAuthority) : null
                      
                      return (
                        <div key={request.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Link href={`/in/${user.id}`}>
                              <Avatar className="h-10 w-10 border border-slate-200/50 dark:border-slate-800 cursor-pointer">
                                <AvatarImage src={user.profile_image?.imagePath} alt={getUserDisplayName(user)} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Link href={`/in/${user.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition">
                                  {getUserDisplayName(user)}
                                </Link>
                                {authority && (
                                  <Badge className={`text-[9px] font-extrabold px-1.5 py-0.5 border ${authority.color}`}>
                                    <authority.icon className="h-2.5 w-2.5 mr-0.5" />
                                    {authority.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                {user.lawyer?.lawFirm ? `@ ${user.lawyer.lawFirm}` : 'Client Member'}
                                <span className="text-slate-400">• Invited</span>
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-200 text-xs font-bold px-3.5 h-8"
                            onClick={() => handleConnectionRequest(request.id, 'cancel')}
                            disabled={processingRequest === request.id}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Withdraw
                          </Button>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )}

            {/* Connections */}
            {activeTab === 'connections' && (
              <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-base font-bold">Connections Network</CardTitle>
                  <CardDescription className="text-xs">Your verified legal colleagues and active client network relationships.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredConnections.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {searchQuery ? 'No matched connections' : 'No active connections'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                          You do not have any network links established yet.
                        </p>
                      </div>
                      {!searchQuery && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4" asChild>
                          <Link href="/">
                            <Compass className="h-3.5 w-3.5 mr-1.5" /> Discover Members
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredConnections.map((connection) => {
                      const user = connection.connectedUser
                      const authority = user.lawyer ? getLawyerAuthority(user.lawyer.badgeIssuingAuthority) : null
                      
                      return (
                        <div key={connection.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Link href={`/in/${user.id}`}>
                              <Avatar className="h-10 w-10 border border-slate-200/50 dark:border-slate-800 cursor-pointer">
                                <AvatarImage src={user.ProfileImage?.imagePath} alt={getUserDisplayName(user)} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Link href={`/in/${user.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition">
                                  {getUserDisplayName(user)}
                                </Link>
                                {authority && (
                                  <Badge className={`text-[9px] font-extrabold px-1.5 py-0.5 border ${authority.color}`}>
                                    <authority.icon className="h-2.5 w-2.5 mr-0.5" />
                                    {authority.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md flex items-center gap-1.5">
                                {user.lawyer?.lawFirm ? `@ ${user.lawyer.lawFirm}` : 'Client Member'}
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-[10px]">
                                  <UserCheck className="h-3 w-3" /> Connected
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 hover:border-blue-200 text-xs font-bold px-3.5 h-8 shrink-0" asChild>
                            <Link href={`/messaging?id=${user.id}`} className="flex items-center">
                              <MessageCircle className="h-3.5 w-3.5 mr-1" /> Message
                            </Link>
                          </Button>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick-action Finder button */}
          <div className="fixed bottom-8 right-8 z-20">
            <Button size="lg" className="rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center p-0 w-12 h-12" asChild>
              <Link href="/">
                <Compass className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyNetworkPage