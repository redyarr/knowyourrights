"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
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
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PostCard from '../../components/feed/PostCard'
import { AnimatePresence, motion } from 'framer-motion'

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null)  
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
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [allLawyers, setAllLawyers] = useState([])
  const [visibleLawyers, setVisibleLawyers] = useState([])
  const [hiddenLawyers, setHiddenLawyers] = useState([])
  const [lawyersLoading, setLawyersLoading] = useState(true)
  
  const [posts, setPosts] = useState([])

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
        setConnectionsCount(data?.connectionsCount)
    }catch(err){
        console.error('Error fetching user profile:', err)
        toast.error("Unable to load your profile data. Please try again later.")
    }finally{
        setLoading(false)
    }
  }

  const fetchSuggestedLawyers = async () => {
    try {
      const response = await fetch('http://localhost:3001/mynetwork/suggested-lawyers', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success && data.lawyers) {
        const lawyers = data.lawyers
        setAllLawyers(lawyers)
        
        // Show first 3, keep rest for cycling
        setVisibleLawyers(lawyers.slice(0, 3))
        setHiddenLawyers(lawyers.slice(3))
      }
    } catch (error) {
      console.error('Error fetching suggested lawyers:', error)
    } finally {
      setLawyersLoading(false)
    }
  }

  // Fetch posts from feed
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/feed?page=1', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  useEffect(()=>{
    fetchUserProfile();
    fetchSuggestedLawyers();
    fetchPosts();
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
          icon: ShieldCheck,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-950/30'
        }
      case 'pending':
        return {
          label: 'Pending Verification',
          icon: Clock,
          color: 'text-amber-700 bg-amber-50 border-amber-200/50 dark:text-amber-400 dark:bg-amber-950/30'
        }
      case 'rejected':
        return {
          label: 'Verification Rejected',
          icon: XCircle,
          color: 'text-rose-700 bg-rose-50 border-rose-200/50 dark:text-rose-400 dark:bg-rose-950/30'
        }
      default:
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-700 bg-blue-50 border-blue-200/50 dark:text-blue-400 dark:bg-blue-950/30'
        }
    }
  }

  const handleImageFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image smaller than 5MB")
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }

      setSelectedImageFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      toast.error("Please select an image to upload")
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
        toast.success("Your profile picture has been updated successfully")
        
        // Update the profile data with new image
        setProfileData(prev => ({
          ...prev,
          profilePicture: data.imagePath
        }))
        
        setShowImageUpload(false)
        setSelectedImageFile(null)
        setImagePreview(null)
        
        const fileInput = document.getElementById('profile-upload')
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        toast.error(data.error || "Failed to upload profile picture")
      }
    } catch (error) {
      console.error('Profile image upload error:', error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const cancelImageUpload = () => {
    setShowImageUpload(false)
    setSelectedImageFile(null)
    setImagePreview(null)
    
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
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  reacts: data.reactions || [],
                  userReaction: data.userReaction || null
                } 
              : post
          )
        }))
        
        setShowReactionPicker(null)
        
        if (data.userReaction) {
          toast.success(`You reacted with ${data.userReaction}`)
        } else {
          toast.success("Reaction removed")
        }
      } else {
        toast.error(data.error || "Failed to react to post")
      }
    } catch (error) {
      console.error('Reaction error:', error)
      toast.error("Failed to react to post")
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
        toast.success("Comment posted successfully")
      } else {
        toast.error(data.error || "Failed to post comment")
      }
    } catch (error) {
      toast.error("Failed to post comment")
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
        toast.success("Post shared successfully")
      } else {
        toast.error(data.error || "Failed to share post")
      }
    } catch (error) {
      toast.error("Failed to share post")
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
            comments: post.comments.filter(comment => comment.id !== commentId)
          }))
        }))
        
        toast.success("Comment deleted successfully")
      } else {
        toast.error(data.error || "Failed to delete comment")
      }
    } catch (error) {
      toast.error("Failed to delete comment")
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
        
        toast.success("Comment updated successfully")
      } else {
        toast.error(data.error || "Failed to edit comment")
      }
    } catch (error) {
      toast.error("Failed to edit comment")
    }
  }

  const handlePostUpdate = (updatedPost, deletedPostId = null) => {
    if (deletedPostId) {
      setPosts(prev => prev.filter(post => post.id !== deletedPostId))
    } else if (updatedPost) {
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ))
    }
  }

  const cycleToNextLawyer = (removedLawyerId) => {
    if (hiddenLawyers.length > 0) {
      const nextLawyer = hiddenLawyers[0]
      
      setVisibleLawyers(prev => 
        prev.map(lawyer => 
          lawyer.id === removedLawyerId ? nextLawyer : lawyer
        )
      )
      
      const removedLawyer = visibleLawyers.find(l => l.id === removedLawyerId)
      if (removedLawyer) {
        setHiddenLawyers(prev => [...prev.slice(1), removedLawyer])
      }
    } else {
      const remainingLawyers = allLawyers.filter(lawyer => 
        !visibleLawyers.some(vl => vl.id === lawyer.id) || lawyer.id === removedLawyerId
      )
      
      if (remainingLawyers.length > 0) {
        const nextLawyer = remainingLawyers[0]
        setVisibleLawyers(prev =>
          prev.map(lawyer =>
            lawyer.id === removedLawyerId ? nextLawyer : lawyer
          )
        )
      }
    }
  }

  const sendConnectionRequest = async (userId, button) => {
    try {
      const response = await fetch(`http://localhost:3001/mynetwork/connect/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Connection request sent successfully")
        
        const updateLawyerStatus = (lawyer) => {
          if (lawyer.id === userId) {
            return {
              ...lawyer,
              connectionStatus: 'pending',
              connectionType: 'sent',
              connectionId: data.connectionId
            }
          }
          return lawyer
        }
        
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        setTimeout(() => {
          cycleToNextLawyer(userId)
        }, 600)
        
      } else {
        toast.error(data.message || 'Failed to send connection request')
        button.textContent = 'Connect'
        button.disabled = false
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast.error('Failed to send connection request. Please try again.')
      button.textContent = 'Connect'
      button.disabled = false
    }
  }

  const cancelConnectionRequest = async (connectionId, button) => {
    try {
      const response = await fetch(`http://localhost:3001/mynetwork/cancel/${connectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Connection request has been cancelled")
        
        const userId = parseInt(button.getAttribute('data-user-id'))
        
        const updateLawyerStatus = (lawyer) => {
          if (lawyer.id === userId) {
            return {
              ...lawyer,
              connectionStatus: null,
              connectionType: null,
              connectionId: null
            }
          }
          return lawyer
        }
        
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        button.textContent = 'Connect'
        button.className = button.className.replace('border-red-600 text-red-600', 'border-blue-600 text-blue-600')
        button.setAttribute('data-action', 'connect')
        button.removeAttribute('data-connection-id')
        button.disabled = false
      } else {
        toast.error(data.message || 'Failed to cancel connection request')
        button.textContent = 'Cancel'
        button.disabled = false
      }
    } catch (error) {
      console.error('Cancel request error:', error)
      toast.error('Failed to cancel request. Please try again.')
      button.textContent = 'Cancel'
      button.disabled = false
    }
  }

  const handleButtonClick = (button) => {
    const action = button.getAttribute('data-action')
    const userId = button.getAttribute('data-user-id')
    const connectionId = button.getAttribute('data-connection-id')
    
    button.disabled = true
    const originalText = button.textContent
    button.textContent = action === 'connect' ? 'Sending...' : 'Cancelling...'
    
    const resetButton = () => {
      button.textContent = originalText
      button.disabled = false
    }
    
    if (action === 'connect') {
      sendConnectionRequest(parseInt(userId), button).catch(() => {
        resetButton()
      })
    } else if (action === 'cancel') {
      cancelConnectionRequest(connectionId, button).catch(() => {
        resetButton()
      })
    }
  }

  const refreshSuggestions = () => {
    const shuffledLawyers = [...allLawyers].sort(() => Math.random() - 0.5)
    setVisibleLawyers(shuffledLawyers.slice(0, 3))
    setHiddenLawyers(shuffledLawyers.slice(3))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="h-44 bg-muted rounded-xl animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card className="h-64 animate-pulse bg-muted/20 border-slate-200 dark:border-slate-800"></Card>
              <Card className="h-40 animate-pulse bg-muted/20 border-slate-200 dark:border-slate-800"></Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="h-96 animate-pulse bg-muted/20 border-slate-200 dark:border-slate-800"></Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Profile Loading Issue</h3>
            <p className="text-xs text-slate-500">{error || 'Unable to retrieve your user credentials.'}</p>
            <Button onClick={fetchUserProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-20 right-10 w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Left Profile Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Banner Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800/80 shadow-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-md overflow-hidden rounded-2xl">
              {/* Cover Banner Area */}
              <div className="h-44 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md text-xs font-bold"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" /> Change Banner
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 relative">
                {/* Profile Picture Overlay */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-24 mb-6 relative z-20">
                  <div className="relative group w-36 h-36">
                    <Avatar className="w-36 h-36 border-4 border-white dark:border-slate-900 shadow-xl bg-white dark:bg-slate-950">
                      <AvatarImage src={profileData?.profile_image?.imagePath || profileData?.profilePicture} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-3xl font-extrabold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Floating Camera Upload Button */}
                    <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition duration-150"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-extrabold text-base">
                            <Camera className="h-5 w-5 text-blue-600" /> Update Avatar
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-5 py-2">
                          <div className="text-center">
                            <div className="relative inline-block">
                              <Avatar className="w-40 h-40 border-4 border-slate-100 dark:border-slate-800 shadow-md">
                                <AvatarImage src={imagePreview || profileData?.profile_image?.imagePath || profileData?.profilePicture} alt="Preview" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-bold">
                                  {getUserInitials()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="profile-upload" className="text-xs font-bold text-slate-500">Choose Image File</Label>
                            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 relative cursor-pointer text-center">
                              <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                {selectedImageFile ? selectedImageFile.name : 'Select JPG or PNG (Max 5MB)'}
                              </span>
                              <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageFileSelect}
                                disabled={uploadingImage}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              onClick={handleImageUpload}
                              disabled={!selectedImageFile || uploadingImage}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex-1"
                            >
                              {uploadingImage ? 'Uploading...' : 'Save Picture'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={cancelImageUpload}
                              disabled={uploadingImage}
                              className="text-xs font-bold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex-1 md:pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        {getUserDisplayName()}
                      </h1>
                      {profileData?.role === 'lawyer' && profileData.lawyer?.badgeIssuingAuthority && (
                        <Badge variant="secondary" className="text-[10px] font-extrabold px-2 py-0.5 border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950">
                          {profileData.lawyer.badgeIssuingAuthority}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize font-semibold">
                      {profileData?.role === 'admin' ? 'Administrator' : 
                       profileData?.role === 'lawyer' ? 'Professional Lawyer Advocate' : 'Client Member'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                      {profileData?.city && profileData?.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {profileData.city}, {profileData.country}
                        </span>
                      )}
                      <Link href="/mynetwork" className="font-bold text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {connectionsCount || 0} connections
                      </Link>
                    </div>
                  </div>

                  <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shrink-0">
                    <Link href="/in/edit">
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About bio card */}
            <Card className="border border-slate-200/85 dark:border-slate-800/85 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800/50">
                <CardTitle className="text-sm font-extrabold tracking-tight">Biography</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full" asChild>
                  <Link href="/in/edit">
                    <Edit3 className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {profileData?.role === 'lawyer' && profileData.lawyer?.summary ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {profileData.lawyer.summary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Welcome to my profile! I'm a {profileData?.role === 'admin' ? 'Administrator' : 'Member'} on LegalNet. No summary bio provided yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity tabbed feed card */}
            <Card className="border border-slate-200/85 dark:border-slate-800/85 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <div>
                  <CardTitle className="text-sm font-extrabold tracking-tight">Activity Feed</CardTitle>
                  <CardDescription className="text-[10px]">Track post engagements, shares, and discussions.</CardDescription>
                </div>

                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-slate-100 font-extrabold text-base">Write a New Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <Input placeholder="Enter a title for your post..." className="bg-slate-50 dark:bg-slate-950 text-xs" />
                      <Textarea placeholder="Share insights or ask legal questions..." rows={4} className="bg-slate-50 dark:bg-slate-950 text-xs" />
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={() => setShowCreatePost(false)} className="text-xs font-bold">
                          Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Publish Post</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                    <TabsTrigger value="posts" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                      My Shared Posts
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                      Recent Comments
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts" className="space-y-6">
                    {posts?.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                          {posts.slice(0, 2).map((post) => (
                            <div key={post.id} className="flex-1 min-w-0">
                              <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white dark:bg-slate-950 p-4 rounded-xl">
                                <PostCard
                                  post={post}
                                  userData={profileData}
                                  onPostUpdate={handlePostUpdate}
                                />
                              </Card>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
                          <Button variant="outline" className="w-full text-xs font-bold border-slate-200 dark:border-slate-800">
                            Show All Shared Posts ({posts.length})
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">No activity yet</h4>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Publish articles or posts to build up client representation outreach.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="space-y-4">
                    {posts?.length > 0 && posts.some(post => post.comments?.length > 0) ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {posts
                            .flatMap(post => post.comments || [])
                            .slice(0, 4)
                            .map((comment) => (
                              <div key={comment.id} className="border border-slate-100 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/40">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-8 w-8 border border-slate-200/30">
                                    <AvatarImage src={comment.user?.profile_image?.imagePath} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-bold">
                                      {comment.user ? `${comment.user.firstName?.[0]}${comment.user.lastName?.[0]}` : 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                        {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Anonymous User'}
                                      </span>
                                      <span className="text-[9px] text-slate-400">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-450 mt-1">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
                          <Button variant="outline" className="w-full text-xs font-bold border-slate-200 dark:border-slate-800">
                            Show All Discussion Logs
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <MessageCircle className="h-8 w-8 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">No discussions logged</h4>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Your comment logs on shared articles will appear here.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Verification Status - Lawyer Credentials Box */}
            {profileData?.role === 'lawyer' && verificationBadge && (
              <Card className="border border-slate-200/85 dark:border-slate-800/85 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                  <h3 className="text-sm font-extrabold flex items-center text-slate-950 dark:text-slate-100">
                    <Award className="h-4.5 w-4.5 mr-2 text-blue-600 dark:text-blue-400 animate-pulse" />
                    Bar Licensure & Verification
                  </h3>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className={`rounded-xl p-5 border ${
                    verificationBadge.color.includes('emerald') 
                      ? 'bg-emerald-50/50 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/40' 
                      : verificationBadge.color.includes('amber') 
                      ? 'bg-amber-50/50 border-amber-250 dark:bg-amber-950/20 dark:border-amber-900/40' 
                      : 'bg-blue-50/50 border-blue-250 dark:bg-blue-950/20 dark:border-blue-900/40'
                  }`}>
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-md ${
                        verificationBadge.color.includes('emerald') 
                          ? 'bg-emerald-600 text-white' 
                          : verificationBadge.color.includes('amber') 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        <verificationBadge.icon className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 capitalize">{verificationBadge.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Verification status is validated by administrative counselors.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {profileData.lawyer?.badgeNumber && (
                        <div className="bg-white/80 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">License Code</p>
                          <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">{profileData.lawyer.badgeNumber}</p>
                        </div>
                      )}
                      
                      {profileData.lawyer?.badgeIssueDate && (
                        <div className="bg-white/80 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</p>
                          <p className="text-xs text-slate-850 dark:text-slate-200 font-semibold">
                            {new Date(profileData.lawyer.badgeIssueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      
                      {profileData.lawyer?.badgeIssuingAuthority && (
                        <div className="bg-white/80 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">State Authority</p>
                          <p className="text-xs text-slate-850 dark:text-slate-200 font-bold capitalize truncate">
                            {profileData.lawyer.badgeIssuingAuthority}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience Card */}
            <Card className="border border-slate-200/85 dark:border-slate-800/85 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <h2 className="text-sm font-extrabold tracking-tight">Professional Experience</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="py-6 text-center space-y-2">
                <Building className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">Professional History</h4>
                <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto">Log previous law firm work, court trial listings, or general advisory services.</p>
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card className="border border-slate-200/85 dark:border-slate-800/85 shadow-sm bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <h2 className="text-sm font-extrabold tracking-tight">Education credentials</h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-6 text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">Academic Credentials</h4>
                {profileData?.lawyer?.degree ? (
                  <div className="text-xs text-slate-650 dark:text-slate-300 font-semibold">
                    {profileData.lawyer.degree} - {profileData.lawyer.universitySelect === 'other' ? profileData.lawyer.university : profileData.lawyer.universitySelect}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto">List legal degrees, Juris Doctor (JD) titles, and certified academic credentials.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Suggested Lawyers */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 dark:border-slate-800/80 shadow-md bg-white dark:bg-slate-900 rounded-2xl overflow-hidden sticky top-24">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs flex items-center text-slate-900 dark:text-slate-100">
                    <Users className="h-4.5 w-4.5 mr-1.5 text-blue-500" />
                    People you may know
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshSuggestions}
                    className="h-7 w-7 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Refresh suggestions"
                    disabled={lawyersLoading || allLawyers.length === 0}
                  >
                    <svg
                      className={`h-3.5 w-3.5 text-slate-400 ${lawyersLoading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {lawyersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full"></div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : visibleLawyers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400">No suggestions available</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchSuggestedLawyers}
                      className="mt-2 text-[10px] font-bold"
                    >
                      Refresh List
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {visibleLawyers.map((lawyer) => {
                        const getButtonConfig = () => {
                          if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'sent') {
                            return {
                              text: 'Cancel',
                              className: 'border-rose-200 hover:border-rose-300 text-rose-600 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400',
                              action: 'cancel',
                              connectionId: lawyer.connectionId
                            }
                          } else if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'received') {
                            return {
                              text: 'Respond',
                              className: 'border-emerald-200 hover:border-emerald-300 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
                              action: 'respond',
                              connectionId: lawyer.connectionId
                            }
                          } else {
                            return {
                              text: 'Connect',
                              className: 'border-blue-200 hover:border-blue-300 text-blue-600 bg-blue-50/30 hover:bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
                              action: 'connect',
                              connectionId: null
                            }
                          }
                        }

                        const buttonConfig = getButtonConfig()

                        return (
                          <motion.div
                            key={lawyer.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="flex items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-850 shrink-0">
                                <AvatarImage src={lawyer.ProfileImage?.imagePath || lawyer.profilePicture} alt={lawyer.firstName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                                  {`${lawyer.firstName?.[0] || ''}${lawyer.lastName?.[0] || ''}`.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-[11px] text-slate-850 dark:text-slate-100 truncate">
                                  {lawyer.firstName} {lawyer.lastName}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {lawyer.Lawyer?.lawFirm || 'Legal Counsel'}
                                </p>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-[10px] font-bold px-2.5 h-7 transition-all ${buttonConfig.className}`}
                              data-user-id={lawyer.id}
                              data-action={buttonConfig.action}
                              data-connection-id={buttonConfig.connectionId}
                              onClick={(e) => handleButtonClick(e.currentTarget)}
                            >
                              {buttonConfig.text}
                            </Button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile