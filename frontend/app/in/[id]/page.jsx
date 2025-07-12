"use client"

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
  Trash2
} from 'lucide-react'

const ProfilePage = () => {
  const params = useParams()
  const userId = params.id
  const [profileData, setProfileData] = useState({})
  console.log('ProfilePage userId:', profileData);
  
  const [loading, setLoading] = useState(true)
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const [showCommentForm, setShowCommentForm] = useState(null)
  const [showComments, setShowComments] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState(null)
  
  const reactionEmojis = {
    like: { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    love: { emoji: '❤️', icon: Heart, label: 'Love' },
    haha: { emoji: '😂', icon: Laugh, label: 'Haha' },
    wow: { emoji: '😮', icon: Sparkles, label: 'Wow' },
    sad: { emoji: '😢', icon: Frown, label: 'Sad' },
    angry: { emoji: '😠', icon: Angry, label: 'Angry' }
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      // Use the correct route: router.get('/:id', ProfileController.getProfile)
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

  // Fetch current user data from session/cookies
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
      fetchCurrentUser() // Add this line
      fetchProfileData()
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

  const handleReaction = async (postId, reactionType) => {
    try {
      const response = await fetch(`http://localhost:3001/feed/post/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction: reactionType }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  reacts: data.reactions || [], // Use the complete reactions array from backend
                  // Remove the separate userReaction field since we'll get it from reacts array
                } 
              : post
          )
        }))
        
        setShowReactionPicker(null)
        
        if (data.userReaction) {
          toast("Reaction Added", {
            description: `You ${data.userReaction} this post`
          })
        } else {
          toast("Reaction Removed", {
            description: "You removed your reaction"
          })
        }
      } else {
        toast("Reaction Failed", {
          description: data.error || "Failed to react to post"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to react to post"
      })
    }
  }

  const handleComment = async (e, postId) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const content = formData.get('content')?.trim()
    
    if (!content) return

    try {
      const response = await fetch(`http://localhost:3001/feed/post/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comments: [...(post.comments || []), data.comment]
                } 
              : post
          )
        }))
        
        e.target.reset()
        setShowCommentForm(null)
        toast("Comment Posted", {
          description: "Your comment has been added successfully"
        })
      } else {
        toast("Comment Failed", {
          description: data.error || "Failed to post comment"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to post comment"
      })
    }
  }

  const handleShare = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3001/feed/post/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast("Post Shared", {
          description: "Post has been shared successfully"
        })
      } else {
        toast("Share Failed", {
          description: data.error || "Failed to share post"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to share post"
      })
    }
  }

  const toggleCommentForm = (postId) => {
    setShowCommentForm(prev => prev === postId ? null : postId)
  }

  const handleReactionHover = (postId, show) => {
    if (reactionPickerTimeout) {
      clearTimeout(reactionPickerTimeout)
      setReactionPickerTimeout(null)
    }
    
    if (show) {
      setShowReactionPicker(postId)
    } else {
      const timeout = setTimeout(() => {
        setShowReactionPicker(null)
      }, 300)
      setReactionPickerTimeout(timeout)
    }
  }

  const handleReactionPickerMouseEnter = (postId) => {
    if (reactionPickerTimeout) {
      clearTimeout(reactionPickerTimeout)
      setReactionPickerTimeout(null)
    }
  }

  const handleReactionPickerMouseLeave = (postId) => {
    const timeout = setTimeout(() => {
      setShowReactionPicker(null)
    }, 300)
    setReactionPickerTimeout(timeout)
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/feed/comment/${commentId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => ({
            ...post,
            comments: post.comments?.filter(comment => comment.id !== commentId)
          }))
        }))
        
        toast("Comment Deleted", {
          description: "Your comment has been deleted successfully"
        })
      } else {
        toast("Delete Failed", {
          description: data.error || "Failed to delete comment"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to delete comment"
      })
    }
  }

  const startEditingComment = (commentId, content) => {
    setEditingCommentId(commentId)
    setEditCommentContent(content)
  }

  const cancelEditingComment = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
  }

  const handleEditComment = async (commentId) => {
    if (!editCommentContent.trim()) return

    try {
      const response = await fetch(`http://localhost:3001/feed/comment/${commentId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editCommentContent.trim() }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => ({
            ...post,
            comments: post.comments?.map(comment => 
              comment.id === commentId 
                ? { ...comment, content: editCommentContent.trim() }
                : comment
            )
          }))
        }))
        
        setEditingCommentId(null)
        setEditCommentContent('')
        
        toast("Comment Updated", {
          description: "Your comment has been updated successfully"
        })
      } else {
        toast("Edit Failed", {
          description: data.error || "Failed to edit comment"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to edit comment"
      })
    }
  }

  const verificationBadge = getVerificationBadge()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg"></div>
            <div className="bg-card p-6 rounded-b-lg border-x border-b">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                <div className="relative self-center sm:self-start">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-full"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-muted rounded w-48"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Profile Not Found</h1>
          <p className="text-muted-foreground mt-2">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              <div className="relative self-center sm:self-start">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData?.profile_image?.imagePath} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Profile Info */}
              <div className="text-center sm:text-start">
                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {getUserDisplayName()}
                  </h1>
                  
                  {verificationBadge && (
                    <Badge variant="secondary" className={`text-sm ${verificationBadge.color} mb-2`}>
                      <verificationBadge.icon className="h-4 w-4 me-2" />
                      {verificationBadge.label}
                    </Badge>
                  )}
                  
                  {profileData?.role === 'lawyer' && profileData.lawyer?.lawFirm && (
                    <p className="text-lg font-medium text-muted-foreground flex items-center justify-center sm:justify-start">
                      <Building className="h-4 w-4 me-2" />
                      {profileData.lawyer.lawFirm}
                    </p>
                  )}
                  
                  {profileData?.lawyer?.badgeNumber && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start mt-1">
                      <Shield className="h-4 w-4 me-2" />
                      License: {profileData.lawyer.badgeNumber}
                    </p>
                  )}
                </div>
                
                {profileData?.city && profileData?.country && (
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 me-2" />
                    <span>{profileData.city}, {profileData.country}</span>
                  </div>
                )}
                
                {/* Contact Information */}
                {profileData?.contacts && profileData.contacts.length > 0 && (
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground mb-4">
                    <Phone className="h-4 w-4 me-2" />
                    <span>{profileData.contacts[0].number}</span>
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{connectionsCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Connections</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profileData?.posts?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profileData?.profileViews || 0}</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                {profileData?.role === 'lawyer' && (
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                )}
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <Users className="h-5 w-5 me-2 text-blue-600" />
                      About
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profileData?.role === 'lawyer' && profileData.lawyer ? (
                      <>
                        {profileData.lawyer.summary && (
                          <p className="text-muted-foreground leading-relaxed">
                            {profileData.lawyer.summary}
                          </p>
                        )}
                        
                        {profileData.lawyer.legalAreas && (
                          <div>
                            <h4 className="font-semibold mb-2">Legal Specializations</h4>
                            <div className="flex flex-wrap gap-2">
                              {profileData.lawyer.legalAreas.split(',').map((area, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                  {area.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-muted-foreground">
                            <Building className="h-4 w-4 me-2" />
                            <span>{profileData.lawyer.lawFirm}</span>
                          </div>
                          
                          {profileData.lawyer.badgeNumber && (
                            <div className="flex items-center text-muted-foreground">
                              <Shield className="h-4 w-4 me-2" />
                              <span>License: {profileData.lawyer.badgeNumber}</span>
                            </div>
                          )}
                          
                          {profileData.lawyer.badgeIssueDate && (
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 me-2" />
                              <span>Licensed since: {new Date(profileData.lawyer.badgeIssueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">
                          {profileData?.role === 'admin' ? 'Administrator' : 'Member'} on LegalNet.
                        </p>
                        {profileData?.interests && (
                          <div>
                            <h4 className="font-semibold mb-2">Interests</h4>
                            <p className="text-muted-foreground">{profileData.interests}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <FileText className="h-5 w-5 me-2 text-blue-600" />
                      Posts ({profileData?.posts?.length || 0})
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {profileData?.posts?.length > 0 ? (
                      <div className="space-y-6">
                        {profileData.posts.map((post) => (
                          <div key={post.id} className="border border-border rounded-lg overflow-hidden bg-card">
                            {/* Post Header */}
                            <div className="p-4">
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={profileData?.profile_image?.imagePath} alt={getUserDisplayName()} />
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {getUserInitials()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-foreground">
                                      {getUserDisplayName()}
                                    </h4>
                                    {verificationBadge && (
                                      <Badge variant="secondary" className={`text-xs ${verificationBadge.color}`}>
                                        <verificationBadge.icon className="h-3 w-3 me-1" />
                                        {verificationBadge.label}
                                      </Badge>
                                    )}
                                  </div>
                                  {profileData?.role === 'lawyer' && profileData.lawyer?.lawFirm && (
                                    <p className="text-sm text-muted-foreground font-medium">
                                      {profileData.lawyer.lawFirm}
                                    </p>
                                  )}
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 me-1" />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="px-4">
                              {post.title && (
                                <h3 className="font-semibold text-lg mb-3 leading-tight">
                                  {post.title}
                                </h3>
                              )}
                              <div className="text-sm leading-relaxed mb-4">
                                <p className="whitespace-pre-wrap break-words">
                                  {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                </p>
                              </div>
                            </div>

                            {/* Post Images */}
                            {post.post_photos && post.post_photos.length > 0 && (
                              <div className="mb-4">
                                {post.post_photos.length === 1 ? (
                                  <div className="relative">
                                    <img
                                      src={post.post_photos[0].photo?.photoPath}
                                      alt="Post image"
                                      className="w-full h-auto object-contain max-h-96"
                                    />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 px-4">
                                    {post.post_photos.slice(0, 4).map((postPhoto, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={postPhoto.photo?.photoPath}
                                          alt="Post image"
                                          className="w-full h-48 object-cover rounded-lg"
                                        />
                                        {post.post_photos.length > 4 && index === 3 && (
                                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                              +{post.post_photos.length - 4}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Post Stats */}
                            <div className="px-4 py-2">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  {post.reacts && post.reacts.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="flex -space-x-1">
                                        {[...new Set(post.reacts.map(r => r.reaction))].slice(0, 3).map((reaction, index) => (
                                          <span key={index} className="text-sm bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center shadow-sm">
                                            {reaction === 'like' && '👍'}
                                            {reaction === 'love' && '❤️'}
                                            {reaction === 'haha' && '😂'}
                                            {reaction === 'wow' && '😮'}
                                            {reaction === 'sad' && '😢'}
                                            {reaction === 'angry' && '😠'}
                                          </span>
                                        ))}
                                      </div>
                                      <span className="font-medium">{post.reacts.length}</span>
                                    </div>
                                  )}
                                </div>
                                {post.comments && post.comments.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    className="p-0 h-auto font-medium hover:text-blue-600"
                                    onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                                  >
                                    {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Post Actions */}
                            <div className="px-4 py-3 border-t border-border">
                              <div className="flex items-center justify-around">
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    className={`flex items-center space-x-2 text-muted-foreground hover:text-blue-600 ${
                                      post.reacts && post.reacts.some(r => r.userId === currentUserId) ? 'text-blue-600' : ''
                                    }`}
                                    onMouseEnter={() => handleReactionHover(post.id, true)}
                                    onMouseLeave={() => handleReactionHover(post.id, false)}
                                    onClick={() => handleReaction(post.id, 'like')}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      {(() => {
                                        const userReact = post.reacts?.find(r => r.userId === currentUserId);
                                        return userReact ? userReact.reaction.charAt(0).toUpperCase() + userReact.reaction.slice(1) : 'Like';
                                      })()}
                                    </span>
                                  </Button>
                                  
                                  {/* Reaction Picker */}
                                  {showReactionPicker === post.id && (
                                    <div
                                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-popover border rounded-lg shadow-xl p-2 z-50"
                                      onMouseEnter={() => handleReactionPickerMouseEnter(post.id)}
                                      onMouseLeave={() => handleReactionPickerMouseLeave(post.id)}
                                    >
                                      <div className="flex space-x-1">
                                        {Object.entries(reactionEmojis).map(([key, { emoji, label }]) => (
                                          <Button
                                            key={key}
                                            variant="ghost"
                                            className="text-lg hover:scale-110 transition-transform p-1 h-auto"
                                            onClick={() => handleReaction(post.id, key)}
                                            title={label}
                                          >
                                            {emoji}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600"
                                  onClick={() => {
                                    toggleCommentForm(post.id)
                                    if (showCommentForm !== post.id && post.comments && post.comments.length > 0) {
                                      setShowComments(post.id)
                                    }
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Comment</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600"
                                  onClick={() => handleShare(post.id)}
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">Share</span>
                                </Button>
                              </div>
                            </div>

                            {/* Comment Form */}
                            {showCommentForm === post.id && (
                              <div className="px-4 py-3 border-t border-border">
                                <form onSubmit={(e) => handleComment(e, post.id)} className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={profileData?.profile_image?.imagePath} alt="Your avatar" />
                                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                                      {getUserInitials()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex space-x-2">
                                    <Input
                                      placeholder="Write a comment..."
                                      className="flex-1"
                                      name="content"
                                      required
                                    />
                                    <Button type="submit" size="sm">
                                      Post
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Comments Section */}
                            {showComments === post.id && post.comments && post.comments.length > 0 && (
                              <div className="px-4 py-3 border-t border-border">
                                <div className="space-y-3">
                                  <div className="space-y-3">
                                    {post.comments.map((comment) => (
                                      <div key={comment.id} className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage 
                                            src={comment.user?.profile_image?.imagePath} 
                                            alt="Commenter" 
                                          />
                                          <AvatarFallback className="bg-gray-500 text-white text-xs">
                                            {comment.user ? `${comment.user.firstName?.[0] || ''}${comment.user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          {editingCommentId === comment.id ? (
                                            <div className="space-y-2">
                                              <Textarea
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="min-h-[60px] text-sm"
                                                placeholder="Edit your comment..."
                                              />
                                              <div className="flex space-x-2">
                                                <Button 
                                                  size="sm" 
                                                  onClick={() => handleEditComment(comment.id)}
                                                  disabled={!editCommentContent.trim()}
                                                >
                                                  Save
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  onClick={cancelEditingComment}
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="bg-muted rounded-lg px-3 py-2">
                                              <div className="flex items-center justify-between">
                                                <div className="font-medium text-sm">
                                                  {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                                                </div>
                                                {/* Show edit/delete options only if current logged-in user owns this comment */}
                                                {currentUser && comment.userId === currentUser.id && (
                                                  <div className="flex space-x-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                                      onClick={() => startEditingComment(comment.id, comment.content)}
                                                    >
                                                      <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                                      onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="text-sm mt-1">{comment.content}</p>
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            <Button variant="ghost" className="p-0 h-auto text-xs hover:text-blue-600">
                                              Like
                                            </Button>
                                            <Button variant="ghost" className="p-0 h-auto text-xs hover:text-blue-600">
                                              Reply
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No posts yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {profileData?.role === 'lawyer' && (
                <TabsContent value="credentials" className="mt-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-semibold flex items-center">
                        <Award className="h-5 w-5 me-2 text-blue-600" />
                        Credentials & Education
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {verificationBadge && (
                        <div className={`rounded-xl p-6 border-2 ${verificationBadge.color.includes('green') ? 'bg-green-50 border-green-200' : verificationBadge.color.includes('yellow') ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-center mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center me-4 ${verificationBadge.color.includes('green') ? 'bg-green-600' : verificationBadge.color.includes('yellow') ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                              {verificationBadge && <verificationBadge.icon className="h-6 w-6 text-white" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{verificationBadge?.label}</h4>
                              <p className="text-sm opacity-80">Professional Status</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {profileData.lawyer?.badgeNumber && (
                        <div className="bg-muted/50 rounded-lg p-4 border">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Shield className="h-4 w-4 me-2" />
                            Professional License
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm">
                              Badge Number: <span className="font-mono bg-background px-2 py-1 rounded">{profileData.lawyer.badgeNumber}</span>
                            </p>
                            {profileData.lawyer.badgeIssueDate && (
                              <p className="text-sm">
                                Issued: {new Date(profileData.lawyer.badgeIssueDate).toLocaleDateString()}
                              </p>
                            )}
                            {profileData.lawyer.badgeIssuingAuthority && (
                              <p className="text-sm">
                                Authority Level: <span className="capitalize font-medium">{profileData.lawyer.badgeIssuingAuthority}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">Recent Activity</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Activity timeline coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Mail className="h-5 w-5 me-2 text-blue-600" />
                  Contact Info
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-muted-foreground me-3" />
                  <span className="text-sm">{profileData?.email}</span>
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
              </CardContent>
            </Card>

            {/* Professional Status */}
            {profileData?.role === 'lawyer' && verificationBadge && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="h-5 w-5 me-2 text-blue-600" />
                    Professional Status
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className={`rounded-xl p-4 border-2 ${verificationBadge.color}`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center me-3 ${verificationBadge.color.replace('text-', 'bg-').replace('bg-', 'bg-').replace('-100', '-600')}`}>
                        <verificationBadge.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold">{verificationBadge.label}</h4>
                        <p className="text-sm opacity-80">Current Status</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {profileData.lawyer?.badgeNumber && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">License Number</p>
                        <p className="text-sm font-mono bg-background px-2 py-1 rounded mt-1">
                          {profileData.lawyer.badgeNumber}
                        </p>
                      </div>
                    )}
                    
                    {profileData.lawyer?.badgeIssueDate && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">License Issue Date</p>
                        <p className="text-sm bg-background px-2 py-1 rounded mt-1">
                          {new Date(profileData.lawyer.badgeIssueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {profileData.lawyer?.badgeIssuingAuthority && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Authority Level</p>
                        <p className="text-sm bg-background px-2 py-1 rounded mt-1 capitalize">
                          {profileData.lawyer.badgeIssuingAuthority}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage