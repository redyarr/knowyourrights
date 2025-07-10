"use client"

import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
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
  UserX
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
        toast("Failed to load network data", {
          description: data.message || "Please try again later"
        })
      }
    } catch (error) {
      console.error('Error fetching network data:', error)
      toast("Network Error", {
        description: "Failed to load your network. Please check your connection."
      })
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
        toast("Success", {
          description: data.message || `Request ${action}ed successfully`
        })
        // Refresh network data
        await fetchNetworkData()
      } else {
        toast("Request Failed", {
          description: data.message || "Please try again"
        })
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Network Error", {
        description: "Failed to process request. Please try again."
      })
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
          label: 'Verified',
          icon: ShieldCheck,
          color: 'text-green-600 bg-green-100'
        }
      case 'consultant':
        return {
          label: 'Consultant',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100'
        }
      case 'training':
        return {
          label: 'Training',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100'
        }
      default:
        return {
          label: 'Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100'
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
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
            
            {/* Tabs Skeleton */}
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted rounded w-24 animate-pulse"></div>
              ))}
            </div>
            
            {/* Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Network</h1>
              <p className="text-muted-foreground">
                Manage your professional relationships
              </p>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Requests ({filteredRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Pending ({filteredPending.length})
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'connections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Connections ({filteredConnections.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {/* Connection Requests */}
            {activeTab === 'requests' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Connection Requests</h2>
                  <p className="text-sm text-muted-foreground">People who want to connect with you</p>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredRequests.length === 0 ? (
                    <div className="p-12 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No requests found' : 'No pending requests'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? 'Try adjusting your search terms'
                          : "You don't have any connection requests at the moment."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredRequests.map((request) => {
                        const user = request.requester
                        const authority = user.lawyer ? getLawyerAuthority(user.lawyer.badgeIssuingAuthority) : null
                        
                        return (
                          <div key={request.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Link href={`/in/${user.id}`}>
                                  <Avatar className="h-10 w-10 cursor-pointer">
                                    <AvatarImage src={user.ProfileImage?.imagePath} alt={getUserDisplayName(user)} />
                                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                                      {getUserInitials(user)}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Link href={`/in/${user.id}`} className="hover:text-blue-600">
                                      <span className="font-medium text-sm">{getUserDisplayName(user)}</span>
                                    </Link>
                                    
                                    {authority && (
                                      <Badge variant="secondary" className={`text-xs ${authority.color}`}>
                                        <authority.icon className="h-3 w-3 mr-1" />
                                        {authority.label}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground">
                                    
                                    {user.lawyer?.lawFirm && `  ${user.lawyer.lawFirm}`}
                                    <span className="ml-2"> Wants to connect</span>
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleConnectionRequest(request.id, 'accept')}
                                  disabled={processingRequest === request.id}
                                  className="h-8 px-3"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {processingRequest === request.id ? 'Processing...' : 'Accept'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConnectionRequest(request.id, 'decline')}
                                  disabled={processingRequest === request.id}
                                  className="h-8 px-3"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pending Requests */}
            {activeTab === 'pending' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Pending Requests</h2>
                  <p className="text-sm text-muted-foreground">Invitations you've sent</p>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredPending.length === 0 ? (
                    <div className="p-12 text-center">
                      <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No pending requests found' : 'No pending requests'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? 'Try adjusting your search terms'
                          : "You haven't sent any connection requests that are waiting for a response."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredPending.map((request) => {
                        const user = request.receiver
                        const authority = (user.lawyer) ? getLawyerAuthority((user.lawyer?.badgeIssuingAuthority)) : null
                        
                        return (
                          <div key={request.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Link href={`/in/${user.id}`}>
                                  <Avatar className="h-10 w-10 cursor-pointer">
                                    <AvatarImage src={user.profile_image?.imagePath} alt={getUserDisplayName(user)} />
                                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                                      {getUserInitials(user)}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Link href={`/in/${user.id}`} className="hover:text-blue-600">
                                      <span className="font-medium text-sm">{getUserDisplayName(user)}</span>
                                    </Link>
                                    
                                    {authority && (
                                      <Badge variant="secondary" className={`text-xs ${authority.color}`}>
                                        <authority.icon className="h-3 w-3 mr-1" />
                                        {authority.label}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground">

                                    {(user.lawyer?.lawFirm) &&<span className='mr-4'>{`${user.lawyer?.lawFirm}`}</span>}
                                    <span className="">• Invitation sent</span>
                                  </p>
                                </div>
                              </div>
                              
                              <div className="ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConnectionRequest(request.id, 'cancel')}
                                  disabled={processingRequest === request.id}
                                  className="h-8 px-3"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  {processingRequest === request.id ? 'Cancelling...' : 'Withdraw'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Connections */}
            {activeTab === 'connections' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Your Connections</h2>
                  <p className="text-sm text-muted-foreground">People you're connected with</p>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredConnections.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No connections found' : 'No connections yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery 
                          ? 'Try adjusting your search terms'
                          : 'Start building your professional network by connecting with other users.'
                        }
                      </p>
                      {!searchQuery && (
                        <Button asChild>
                          <Link href="/">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Find People
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredConnections.map((connection) => {
                        const user = connection.connectedUser
                        const authority = user.lawyer ? getLawyerAuthority(user.lawyer.badgeIssuingAuthority) : null
                        
                        return (
                          <div key={connection.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Link href={`/in/${user.id}`}>
                                  <Avatar className="h-10 w-10 cursor-pointer">
                                    <AvatarImage src={user.ProfileImage?.imagePath} alt={getUserDisplayName(user)} />
                                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                                      {getUserInitials(user)}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Link href={`/in/${user.id}`} className="hover:text-blue-600">
                                      <span className="font-medium text-sm">{getUserDisplayName(user)}</span>
                                    </Link>
                                    
                                    {authority && (
                                      <Badge variant="secondary" className={`text-xs ${authority.color}`}>
                                        <authority.icon className="h-3 w-3 mr-1" />
                                        {authority.label}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <span>
                                      
                                      {user.lawyer?.lawFirm && `  ${user.lawyer.lawFirm}`}
                                    </span>
                                    <div className="flex items-center text-green-600 ml-2">
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Connected
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="ml-4">
                                <Button size="sm" variant="outline" className="h-8 px-3" asChild>
                                  <Link href={`/messaging/${user.id}`}>
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Message
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <Button size="lg" className="rounded-full shadow-lg" asChild>
              <Link href="/">
                <UserPlus className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyNetworkPage