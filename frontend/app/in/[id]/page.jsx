"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PostCard from '../../../components/feed/PostCard'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  FileText, 
  Award, 
  Building, 
  Shield, 
  Clock, 
  GraduationCap, 
  XCircle,
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Heart, 
  Laugh, 
  Frown, 
  Angry,
  Sparkles,
  Edit3,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  Plus,
  Loader2,
  Camera,
  AlertTriangle
} from 'lucide-react'

const ProfilePage = () => {
  const params = useParams()
  const id = params.id
  const userId = parseInt(id);
  
  const [profileData, setProfileData] = useState({})    
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)  
  const [currentUser, setCurrentUser] = useState(null)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [connectionId, setConnectionId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [senderOrReceiver, setSenderOrReceiver] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [posts, setPosts] = useState([])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/in/${userId}`, {
        method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      const data = await response.json()
      
      
      if (data.success) {
        setProfileData(data?.data?.user)
        setCurrentUserId(data?.data?.loggedInUserId)
        setConnectionsCount(data?.data?.connectionsCount)
        setConnectionStatus(data?.data?.connectionStatus || null)
        setConnectionId(data?.data?.connectionId || null)
        setSenderOrReceiver(data?.data?.senderOrReceiver || null)
      } else {
        toast("Error", {
          description: "Failed to load profile"
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast("Error", {
        description: "Failed to load profile"
      })
    } finally {
      setLoading(false)
    }
  }

  // Add function to fetch posts from feed
  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:3001/feed/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      
      if (data.success) {
        console.log('Posts fetched successfully:', data);
        
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/getuserdata')
      const data = await response.json()
      
      if (data.success) {
        setCurrentUser(data.payload)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchCurrentUser()
      fetchProfileData()
      fetchPosts()
    }
  }, [userId])

  const getUserDisplayName = () => {
    if (!profileData) return 'Unknown User'
    return `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
  }

  const getUserInitials = () => {
    if (!profileData) return 'U'
    return `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase()
  }

  const getVerificationBadge = () => {
    if (profileData?.role !== 'lawyer' || !profileData.lawyer) return null
    
    const status = profileData.lawyer.verificationStatus
    
    switch (status) {
      case 'approved':
        return {
          label: 'Verified Lawyer',
          icon: Shield,
          color: 'text-green-600 bg-green-100 border-green-200'
        }
      case 'pending':
        return {
          label: 'Pending Verification',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200'
        }
      case 'rejected':
        return {
          label: 'Verification Rejected',
          icon: XCircle,
          color: 'text-red-600 bg-red-100 border-red-200'
        }
      default:
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100 border-blue-200'
        }
    }
  }

  const handleConnectionRequest = async () => {
    if (isConnecting) return

    setIsConnecting(true)

    try {
      let response
      let successMessage
      
      if (connectionStatus === null) {
        response = await fetch(`http://localhost:3001/mynetwork/connect/${userId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          setConnectionStatus('pending')
          setConnectionId(data.connectionId)
          setSenderOrReceiver('sender') 
          successMessage = "Connection request sent successfully!"
        } else {
          throw new Error(data.message || "Failed to send connection request")
        }
        
      } else if (connectionStatus === 'pending' && senderOrReceiver === 'sender') {
        if (!connectionId) {
          console.error('No connection ID available for cancellation')
          throw new Error("Connection ID not found. Please refresh the page and try again.")
        }
        
        console.log('Cancelling connection request with ID:', connectionId)
        
        response = await fetch(`http://localhost:3001/mynetwork/cancel/${connectionId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          setConnectionStatus(null)
          setConnectionId(null)
          setSenderOrReceiver(null)
          successMessage = "Connection request cancelled successfully!"
        } else {
          console.error('Cancel connection failed:', data)
          throw new Error(data.message || "Failed to cancel connection request")
        }
        
      } else if (connectionStatus === 'pending' && senderOrReceiver === 'receiver') {
        if (!connectionId) {
          throw new Error("Connection ID not found. Please refresh the page and try again.")
        }
        
        response = await fetch(`http://localhost:3001/mynetwork/accept/${connectionId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          setConnectionStatus('accepted')
          setSenderOrReceiver(null)
          successMessage = "Connection request accepted successfully!"
        } else {
          console.error('Accept connection failed:', data)
          throw new Error(data.message || "Failed to accept connection request")
        }
      }
      
      if(connectionStatus !== 'accepted'){
        toast("Success", {
          description: successMessage
        })
      } else {
        return
      }
      
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Error", {
        description: error.message || "An error occurred with the connection request"
      })
      
      if (connectionStatus === 'pending') {
        console.log('Refreshing profile data due to error...')
        setTimeout(() => {
          fetchProfileData()
        }, 1500)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeclineRequest = async () => {
    if (isConnecting) return

    setIsConnecting(true)

    try {
      if (!connectionId) {
        throw new Error("Connection ID not found. Please refresh the page and try again.")
      }

      console.log('Declining connection request with ID:', connectionId)

      const response = await fetch(`http://localhost:3001/mynetwork/decline/${connectionId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      console.log('Decline response:', data)

      if (data.success) {
        setConnectionStatus(null)
        setConnectionId(null)
        setSenderOrReceiver(null)
        
        toast("Success", {
          description: "Connection request declined successfully!"
        })
      } else {
        console.error('Decline connection failed:', data)
        throw new Error(data.message || "Failed to decline connection request")
      }
    } catch (error) {
      console.error('Decline request error:', error)
      toast("Error", {
        description: error.message || "An error occurred while declining the request"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const getConnectionButton = () => {
    // Don't show connection button if viewing own profile
    if (currentUserId === userId) {
      return null
    }

    const getButtonConfig = () => {
      // If connection is accepted
      if (connectionStatus === 'accepted') {
        return {
          type: 'single',
          text: 'Friends',
          icon: UserCheck,
          variant: 'default',
          className: 'bg-green-600 hover:bg-green-700 text-white pointer-default',
          disabled: false
        }
      }
      
      // If connection is pending
      if (connectionStatus === 'pending') {
        if (senderOrReceiver === 'sender') {
          // I sent the request - show Cancel button
          return {
            type: 'single',
            text: isConnecting ? 'Cancelling...' : 'Cancel Request',
            icon: isConnecting ? Loader2 : UserX,
            variant: 'outline',
            className: 'border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700',
            disabled: isConnecting
          }
        } else if (senderOrReceiver === 'receiver') {
          // I received the request - show Accept and Decline buttons
          return {
            type: 'dual',
            acceptText: isConnecting ? 'Accepting...' : 'Accept',
            declineText: isConnecting ? 'Declining...' : 'Decline',
            acceptIcon: isConnecting ? Loader2 : UserCheck,
            declineIcon: isConnecting ? Loader2 : UserX,
            disabled: isConnecting
          }
        }
      }
      
      // No connection - show Connect button
      return {
        type: 'single',
        text: isConnecting ? 'Connecting...' : 'Connect',
        icon: isConnecting ? Loader2 : UserPlus,
        variant: 'default',
        className: 'bg-blue-600 hover:bg-blue-700',
        disabled: isConnecting
      }
    }

    const config = getButtonConfig()

    if (config.type === 'dual') {
      // Show Accept and Decline buttons side by side
      const AcceptIcon = config.acceptIcon
      const DeclineIcon = config.declineIcon

      return (
        <div className="flex gap-2">
          <Button
            onClick={handleConnectionRequest}
            disabled={config.disabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <AcceptIcon className={`h-4 w-4 me-2 ${isConnecting ? 'animate-spin' : ''}`} />
            {config.acceptText}
          </Button>
          <Button
            onClick={handleDeclineRequest}
            disabled={config.disabled}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <DeclineIcon className={`h-4 w-4 me-2 ${isConnecting ? 'animate-spin' : ''}`} />
            {config.declineText}
          </Button>
        </div>
      )
    } else {
      // Show single button
      const IconComponent = config.icon

      return (
        <Button
          onClick={handleConnectionRequest}
          disabled={config.disabled}
          variant={config.variant}
          className={config.className}
        >
          <IconComponent className={`h-4 w-4 me-2 ${isConnecting ? 'animate-spin' : ''}`} />
          {config.text}
        </Button>
      )
    }
  }

  // Post update handler for PostCard
  const handlePostUpdate = (updatedPost, deletedPostId = null) => {
    if (deletedPostId) {
      setPosts(prev => prev.filter(post => post.id !== deletedPostId))
    } else if (updatedPost) {
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ))
    }
  }

  const verificationBadge = getVerificationBadge()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="animate-pulse space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="animate-pulse space-y-4">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileData || Object.keys(profileData).length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full rounded-md max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/feed">Go Back to Feed</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Header Section */}
            <Card className="overflow-hidden rounded-md border border-border py-0">
              {/* Cover Image */}
              <div className="h-44 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                {currentUserId === userId && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/20 dark:bg-black/20 dark:hover:bg-black/30"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Edit Cover
                  </Button>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  {/* Left Side - Profile Info */}
                  <div className="flex-1">
                    {/* Profile Image */}
                    <div className="relative w-fit -mt-32 mb-6">
                      <Avatar className="w-40 h-40 border-4 border-background shadow-lg">
                        <AvatarImage src={profileData?.profile_image?.imagePath || profileData?.profilePicture} alt={getUserDisplayName()} />
                        <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Name and Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">
                        {getUserDisplayName()}
                      </h1>
                      {profileData?.role === 'lawyer' && profileData.lawyer?.badgeIssuingAuthority && (
                        <Badge variant="secondary" className="text-sm font-medium bg-muted text-foreground">
                          {profileData.lawyer.badgeIssuingAuthority}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Location */}
                    {profileData?.city && profileData?.country && (
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{profileData.city}, {profileData.country}</span>
                      </div>
                    )}
                    
                    {/* Connections */}
                    <div className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                      {connectionsCount || 0} connections
                    </div>
                  </div>
                  
                  {/* Right Side - Action Buttons */}
                  <div className="flex items-center gap-2">
                    {currentUserId === userId ? (
                      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/in/edit">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    ) : (
                      getConnectionButton()
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border rounded-md border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">About</h2>
                {currentUserId === userId && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {profileData?.role === 'lawyer' && profileData.lawyer?.summary ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {profileData.lawyer.summary}
                  </p>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to my profile! I'm a {profileData?.role === 'admin' ? 'Administrator' : 'Member'} on LegalNet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Section */}
            <Card className="border rounded-md border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Activity</h2>
                {currentUserId === userId && (
                  <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background border border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Create a new post</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Post title..." className="bg-background border-input text-foreground" />
                        <Textarea placeholder="What's on your mind?" rows={4} className="bg-background border-input text-foreground" />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreatePost(false)} className="border-input text-foreground hover:bg-muted">
                            Cancel
                          </Button>
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Post</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                    <TabsTrigger value="posts" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Posts</TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-background data-[state=active]:text-foreground">Comments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts" className="space-y-6">
                    {posts?.length > 0 ? (
                      <>
                        {/* Posts in Flexible Row - Side by Side */}
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                          {posts.slice(0, 2).map((post) => (
                            <div key={post.id} className="flex-1 min-w-0">
                              <PostCard
                                post={post}
                                userData={profileData}
                                onPostUpdate={handlePostUpdate}
                              />
                            </div>
                          ))}
                          
                          {/* If only 1 post exists, add empty div to maintain flex layout */}
                          {posts.length === 1 && (
                            <div className="flex-1 min-w-0 hidden lg:block"></div>
                          )}
                        </div>
                        
                        {/* Show All Posts Button */}
                        <div className="border-t border-border pt-6 text-center">
                          <Button variant="outline" className="w-full border-input text-foreground hover:bg-muted">
                            Show all posts ({posts.length})
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No posts yet.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="space-y-4">
                    {posts?.length > 0 && posts.some(post => post.comments?.length > 0) ? (
                      <>
                        {/* Comments in a single column - more compact */}
                        <div className="space-y-4">
                          {posts
                            .flatMap(post => post.comments || [])
                            .slice(0, 5)
                            .map((comment) => (
                              <div key={comment.id} className="border border-border rounded-lg p-4 bg-card">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user?.profile_image?.imagePath} />
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                      {comment.user ? `${comment.user.firstName?.[0]}${comment.user.lastName?.[0]}` : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-sm text-foreground">
                                        {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        {/* Show All Comments Button */}
                        <div className="border-t border-border pt-4 text-center">
                          <Button variant="outline" className="w-full border-input text-foreground hover:bg-muted">
                            Show all comments
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No comments yet.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Professional Status - For Lawyers */}
            {profileData?.role === 'lawyer' && verificationBadge && (
              <Card className="border rounded-md border-border">
                <CardHeader>
                  <h3 className="text-xl font-semibold flex items-center text-foreground">
                    <Award className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Professional Status
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className={`rounded-xl p-6 border-2 ${
                    verificationBadge.color.includes('green') 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                      : verificationBadge.color.includes('yellow') 
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800' 
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
                  }`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        verificationBadge.color.includes('green') 
                          ? 'bg-green-600' 
                          : verificationBadge.color.includes('yellow') 
                          ? 'bg-yellow-600' 
                          : 'bg-blue-600'
                      }`}>
                        <verificationBadge.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{verificationBadge.label}</h4>
                        <p className="text-sm text-muted-foreground">Current Status</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {profileData.lawyer?.badgeNumber && (
                        <div className="bg-background/50 dark:bg-background/20 rounded-lg p-4 border border-border/50">
                          <p className="text-sm font-medium text-foreground mb-1">License Number</p>
                          <p className="font-mono text-sm bg-background border border-border px-3 py-2 rounded">
                            {profileData.lawyer.badgeNumber}
                          </p>
                        </div>
                      )}
                      
                      {profileData.lawyer?.badgeIssueDate && (
                        <div className="bg-background/50 dark:bg-background/20 rounded-lg p-4 border border-border/50">
                          <p className="text-sm font-medium text-foreground mb-1">License Issue Date</p>
                          <p className="text-sm bg-background border border-border px-3 py-2 rounded">
                            {new Date(profileData.lawyer.badgeIssueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      
                      {profileData.lawyer?.badgeIssuingAuthority && (
                        <div className="bg-background/50 dark:bg-background/20 rounded-lg p-4 border border-border/50">
                          <p className="text-sm font-medium text-foreground mb-1">Authority Level</p>
                          <p className="text-sm bg-background border border-border px-3 py-2 rounded capitalize">
                            {profileData.lawyer.badgeIssuingAuthority}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience Section - Placeholder */}
            <Card className="border rounded-md border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Experience</h2>
                {currentUserId === userId && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Experience section coming soon...
                </p>
              </CardContent>
            </Card>

            {/* Education Section - Placeholder */}
            <Card className="border rounded-md border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Education</h2>
                {currentUserId === userId && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Education section coming soon...
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Contact Info */}
          <div className="lg:col-span-1">
            <Card className="border rounded-md border-border">
              <CardHeader>
                <h3 className="font-semibold flex items-center text-foreground">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Info
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground me-3" />
                    <span className="text-sm break-all">{profileData?.email}</span>
                  </div>
                  {profileData?.city && profileData?.country && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground me-3" />
                      <span className="text-sm">{profileData.city}, {profileData.country}</span>
                    </div>
                  )}
                  {profileData?.contacts && profileData.contacts.length > 0 && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-muted-foreground me-3" />
                      <span className="text-sm">{profileData.contacts[0].number}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground me-3" />
                    <span className="text-sm">Joined {new Date(profileData?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage