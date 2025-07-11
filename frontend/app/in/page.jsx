"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { toast } from "sonner"
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  FileText, 
  Award, 
  Calendar,
  Building,
  GraduationCap,
  Shield,
  Edit3,
  Plus,
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Crown,
  Trash2,
  X,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  Laugh,
  Frown,
  Angry,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null)
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const [showCommentForm, setShowCommentForm] = useState(null)
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState(null)
  const [showComments, setShowComments] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  
  const fetchUserProfile = async () => {
    setLoading(true)
    setError(null)
    try{
        const response = await fetch("http://localhost:3001/in", {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()
        console.log('Fetched user profile data:', data);
        
        setProfileData(data.user)
        setPost(data.user.posts)
    }catch(err){
        console.error('Error fetching user profile:', err)
        toast("Error fetching profile", {
          description: "Unable to load your profile data. Please try again later."}
        )
    }finally{
        setLoading(false)
    }
  }

  useEffect(()=>{
    fetchUserProfile();
  },[])

  const getUserInitials = () => {
    if (!profileData) return 'U'
    return `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!profileData) return 'Unknown User'
    return `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
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

  const handleImageFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast("File Too Large", {
          description: "Please select an image smaller than 5MB"
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast("Invalid File Type", {
          description: "Please select an image file"
        })
        return
      }

      setSelectedImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      toast("No Image Selected", {
        description: "Please select an image to upload"
      })
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('profileImage', selectedImageFile)

      const response = await fetch('http://localhost:3001/in/upload-profile-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast("Profile Picture Updated", {
          description: "Your profile picture has been updated successfully"
        })
        
        // Update the profile data with new image
        setProfileData(prev => ({
          ...prev,
          profilePicture: data.imagePath
        }))
        
        // Close the dialog and reset states
        setShowImageUpload(false)
        setSelectedImageFile(null)
        setImagePreview(null)
        
        // Reset file input
        const fileInput = document.getElementById('profile-upload')
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        toast("Upload Failed", {
          description: data.error || "Failed to upload profile picture"
        })
      }
    } catch (error) {
      console.error('Profile image upload error:', error)
      toast("Network Error", {
        description: "Failed to upload image. Please try again."
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const cancelImageUpload = () => {
    setShowImageUpload(false)
    setSelectedImageFile(null)
    setImagePreview(null)
    
    // Reset file input
    const fileInput = document.getElementById('profile-upload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const reactionEmojis = {
    like: { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    love: { emoji: '❤️', icon: Heart, label: 'Love' },
    haha: { emoji: '😂', icon: Laugh, label: 'Haha' },
    wow: { emoji: '😮', icon: Sparkles, label: 'Wow' },
    sad: { emoji: '😢', icon: Frown, label: 'Sad' },
    angry: { emoji: '😠', icon: Angry, label: 'Angry' }
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
        // Update the specific post in the profile data
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  reacts: data.reactions,
                  userReaction: data.userReaction 
                } 
              : post
          )
        }))
        setShowReactionPicker(null)
        toast("Reaction Added", {
          description: `You ${data.userReaction || 'removed your reaction on'} this post`
        })
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
        // Update the specific post in the profile data
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
        
        // Reset form
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
        // Update posts to remove the deleted comment
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => ({
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId)
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
        // Update posts to reflect the edited comment
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => ({
            ...post,
            comments: post.comments.map(comment => 
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

  const cancelEditingComment = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Profile Header Skeleton */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative rounded-t-lg animate-pulse"></div>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start -mt-12 sm:-mt-16 mb-6">
                <div className="relative self-center sm:self-start">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-muted animate-pulse"></div>
                </div>
                <div className="mt-4 sm:mt-16 flex justify-center sm:justify-end space-x-2">
                  <div className="w-24 h-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="w-24 h-10 bg-muted rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">Unable to load your profile data</p>
            <Button onClick={fetchProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute top-4 end-4">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Profile Photo & Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start -mt-12 sm:-mt-16 mb-6">
              <div className="relative self-center sm:self-start">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData?.profile_image?.imagePath || profileData?.profilePicture} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-0 end-0 rounded-full w-8 h-8 p-0 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Camera className="h-5 w-5 me-2 text-blue-600" />
                        Update Profile Picture
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Current Profile Picture */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          <Avatar className="w-24 h-24 mx-auto border-4 border-gray-200">
                            <AvatarImage 
                              src={imagePreview || profileData?.profilePicture} 
                              alt="Profile Preview" 
                            />
                            <AvatarFallback className="bg-blue-600 text-white text-xl">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          {imagePreview && (
                            <div className="absolute -top-2 -right-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                New
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File Input */}
                      <div className="space-y-2">
                        <Label htmlFor="profile-upload">Choose New Picture</Label>
                        <Input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          disabled={uploadingImage}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </p>
                      </div>

                      {/* Selected File Info */}
                      {selectedImageFile && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {selectedImageFile.name}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-300">
                                {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedImageFile(null)
                                setImagePreview(null)
                                const fileInput = document.getElementById('profile-upload')
                                if (fileInput) fileInput.value = ''
                              }}
                              disabled={uploadingImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={handleImageUpload}
                          disabled={!selectedImageFile || uploadingImage}
                          className="flex-1"
                        >
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Update Picture
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelImageUpload}
                          disabled={uploadingImage}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 sm:mt-16 flex justify-center sm:justify-end">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild>
                    <Link href="/in/edit">
                      <Edit3 className="h-4 w-4 me-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 me-2" />
                    Add Section
                  </Button>
                </div>
              </div>
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
                
                {profileData.lawyer?.badgeNumber && (
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
                  <div className="text-2xl font-bold text-blue-600">{connectionsCount}</div>
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
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Posts</span>
                </TabsTrigger>
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
                          Welcome to my profile! I'm a {profileData?.role} on LegalNet, connecting with legal professionals.
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
              
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <TrendingUp className="h-5 w-5 me-2 text-blue-600" />
                      Recent Activity
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Updated profile information</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                        <Edit3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Connected with new professionals</p>
                          <p className="text-sm text-muted-foreground">1 day ago</p>
                        </div>
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="posts" className="mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <FileText className="h-5 w-5 me-2 text-blue-600" />
                      My Posts ({profileData?.posts?.length || 0})
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
                                  <AvatarImage src={profileData?.profile_image?.imagePath || profileData?.profilePicture} alt={getUserDisplayName()} />
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
                                      src={post.post_photos[0].photo?.photoPath || post.post_photos[0].photoPath}
                                      alt="Post image"
                                      className="w-full h-auto object-contain max-h-96"
                                    />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 px-4">
                                    {post.post_photos.slice(0, 4).map((postPhoto, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={postPhoto.photo?.photoPath || postPhoto.photoPath}
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

                            {/* Post Stats and Actions */}
                            <div className="px-4 py-3 border-t border-border">
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                <div className="flex items-center space-x-4">
                                  {post.reacts && post.reacts.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <div className="flex -space-x-1">
                                        <span className="text-sm">👍</span>
                                        <span className="text-sm">❤️</span>
                                      </div>
                                      <span className="font-medium">{post.reacts.length}</span>
                                    </div>
                                  )}
                                </div>
                                {post.comments && post.comments.length > 0 && (
                                  <span className="font-medium">{post.comments.length} comments</span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-around">
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    className={`flex items-center space-x-2 text-muted-foreground hover:text-blue-600 ${post.userReaction ? 'text-blue-600' : ''}`}
                                    onMouseEnter={() => handleReactionHover(post.id, true)}
                                    onMouseLeave={() => handleReactionHover(post.id, false)}
                                    onClick={() => handleReaction(post.id, 'like')}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      {post.userReaction ? post.userReaction.charAt(0).toUpperCase() + post.userReaction.slice(1) : 'Like'}
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
                                  onClick={() => toggleCommentForm(post.id)}
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

                            {/* Comments Section - Show existing comments */}
                            {post.comments && post.comments.length > 0 && (
                              <div className="px-4 py-3 border-t border-border">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-foreground">
                                      Comments ({post.comments.length})
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowComments(prev => prev === post.id ? null : post.id)}
                                      className="text-xs"
                                    >
                                      {showComments === post.id ? 'Hide' : 'Show all'}
                                    </Button>
                                  </div>
                                  
                                  {/* Show comments (limit to 3 by default, show all if expanded) */}
                                  <div className="space-y-3">
                                    {(showComments === post.id ? post.comments : post.comments.slice(0, 3)).map((comment) => (
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
                                          <div className="bg-muted rounded-lg px-3 py-2">
                                            <div className="flex items-center justify-between">
                                              <div className="font-medium text-sm">
                                                {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                                              </div>
                                              {/* Show edit/delete options if it's user's own comment */}
                                              {profileData && comment.userId === profileData.id && (
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
                                  
                                  {/* Show "View more comments" if there are more than 3 */}
                                  {post.comments.length > 3 && showComments !== post.id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowComments(post.id)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      View {post.comments.length - 3} more comments
                                    </Button>
                                  )}
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
                        {profileData?.role === 'lawyer' && (
                          <Button asChild className="mt-4">
                            <Link href="/">Create your first post</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
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
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Crown className="h-5 w-5 me-2 text-blue-600" />
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    <FileText className="h-4 w-4 me-2" />
                    View Feed
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/mynetwork">
                    <Users className="h-4 w-4 me-2" />
                    My Network
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/in/edit">
                    <Edit3 className="h-4 w-4 me-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Status - Only for lawyers */}
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

export default UserProfile