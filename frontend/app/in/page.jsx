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
        toast("Error fetching profile", {
          description: "Unable to load your profile data. Please try again later."}
        )
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

  // Add function to fetch posts from feed
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
    fetchPosts(); // Add this to fetch posts
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
        // Update the specific post with the COMPLETE reaction data from backend
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  // Use the complete reactions array from backend
                  reacts: data.reactions || [],
                  // Set user's current reaction (null if removed, reaction type if added/changed)
                  userReaction: data.userReaction || null
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
      console.error('Reaction error:', error)
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
        // Update posts to reflect the edited comment
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
    // If we have hidden lawyers, show the next one
    if (hiddenLawyers.length > 0) {
      const nextLawyer = hiddenLawyers[0]
      
      setVisibleLawyers(prev => 
        prev.map(lawyer => 
          lawyer.id === removedLawyerId ? nextLawyer : lawyer
        )
      )
      
      // Move the removed lawyer to the end of hidden lawyers and remove the shown one
      const removedLawyer = visibleLawyers.find(l => l.id === removedLawyerId)
      if (removedLawyer) {
        setHiddenLawyers(prev => [...prev.slice(1), removedLawyer])
      }
    } else {
      // If no hidden lawyers, just cycle from all lawyers
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
        toast("Connection Request Sent", {
          description: "Your connection request has been sent successfully"
        })
        
        // Update the lawyer's status in ALL arrays (visible, hidden, and all)
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
        
        // Update visible lawyers
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update hidden lawyers
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update all lawyers
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        // Start the cycling animation after a short delay
        setTimeout(() => {
          cycleToNextLawyer(userId)
        }, 600) // Wait for exit animation to complete
        
      } else {
        toast("Request Failed", {
          description: data.message || 'Failed to send connection request'
        })
        button.textContent = 'Connect'
        button.disabled = false
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Network Error", {
        description: 'Failed to send connection request. Please try again.'
      })
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
        toast("Request Cancelled", {
          description: "Your connection request has been cancelled"
        })
        
        const userId = parseInt(button.getAttribute('data-user-id'))
        
        // Update the lawyer's status in ALL arrays (visible, hidden, and all)
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
        
        // Update visible lawyers
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update hidden lawyers  
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update all lawyers
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        button.textContent = 'Connect'
        button.className = button.className.replace('border-red-600 text-red-600', 'border-blue-600 text-blue-600')
        button.setAttribute('data-action', 'connect')
        button.removeAttribute('data-connection-id')
        button.disabled = false
      } else {
        toast("Cancel Failed", {
          description: data.message || 'Failed to cancel connection request'
        })
        button.textContent = 'Cancel'
        button.disabled = false
      }
    } catch (error) {
      console.error('Cancel request error:', error)
      toast("Network Error", {
        description: 'Failed to cancel request. Please try again.'
      })
      button.textContent = 'Cancel'
      button.disabled = false
    }
  }

  const handleButtonClick = (button) => {
    const action = button.getAttribute('data-action')
    const userId = button.getAttribute('data-user-id')
    const connectionId = button.getAttribute('data-connection-id')
    
    // Disable button and show loading state
    button.disabled = true
    const originalText = button.textContent
    button.textContent = action === 'connect' ? 'Sending...' : 'Cancelling...'
    
    // Helper function to reset button state
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
    // Shuffle all lawyers and show 3 new ones
    const shuffledLawyers = [...allLawyers].sort(() => Math.random() - 0.5)
    setVisibleLawyers(shuffledLawyers.slice(0, 3))
    setHiddenLawyers(shuffledLawyers.slice(3))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Loading */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Header Loading */}
              <Card className="overflow-hidden rounded-md border border-border">
                {/* Cover Area */}
                <div className="h-44 bg-muted animate-pulse relative"></div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Profile Image */}
                      <div className="relative w-fit -mt-32 mb-6">
                        <div className="w-40 h-40 bg-muted rounded-full border-4 border-background animate-pulse"></div>
                      </div>
                      
                      {/* Name and Info */}
                      <div className="space-y-3">
                        <div className="h-8 bg-muted rounded animate-pulse w-64"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-48"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section Loading */}
              <Card className="border rounded-md border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/5"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Section Loading */}
              <Card className="border rounded-md border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                  <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  {/* Tabs Loading */}
                  <div className="flex space-x-1 mb-6">
                    <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                  
                  {/* Posts Loading */}
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Post 1 */
                    /* Post 2 */}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Sections Loading */}
              <Card className="border rounded-md border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="h-6 bg-muted rounded animate-pulse w-32"></div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded animate-pulse w-full"></div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Sidebar Loading */}
            <div className="lg:col-span-1">
              <Card className="border rounded-md border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 bg-muted rounded animate-pulse w-32"></div>
                    </div>
                    <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full rounded-md max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUserProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full rounded-md max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">Unable to load your profile data</p>
            <Button onClick={fetchUserProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge()

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
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/20 dark:bg-black/20 dark:hover:bg-black/30"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Edit Cover
                </Button>
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
                      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-white border-2 border-white shadow-md hover:bg-gray-50"
                          >
                            <Camera className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl sm:h-full sm:max-h-[500px]">
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
                                <Avatar className="w-64 h-64 mx-auto border-4 border-gray-200">
                                  <AvatarImage 
                                    src={profileData?.profile_image?.imagePath || profileData?.profilePicture} 
                                    alt="Profile Preview" 
                                  />
                                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                                    {getUserInitials()}
                                  </AvatarFallback>
                                </Avatar>
                                {imagePreview && (
                                  <div className="absolute -top-2 -right-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
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
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-blue-900">
                                      {selectedImageFile.name}
                                    </p>
                                    <p className="text-xs text-blue-600">
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
                                    className="h-8 w-8 p-0"
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
                    
                    {/* Connections Link */}
                    <Link 
                      href="/mynetwork" 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {connectionsCount || 0} connections
                    </Link>
                  </div>
                  
                  {/* Right Side - Edit Button */}
                  <div className="flex items-center gap-2">
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/in/edit">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border rounded-md border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">About</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Edit3 className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </Button>
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
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Education section coming soon...
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - People You May Know */}
          <div className="lg:col-span-1">
            <Card className="border rounded-md border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center text-foreground text-sm">
                    <Users className="h-5 w-5 mr-2" />
                    People you may know
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshSuggestions}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                    title="Refresh suggestions"
                    disabled={lawyersLoading || allLawyers.length === 0}
                  >
                    <svg
                      className={`h-4 w-4 ${lawyersLoading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lawyersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse"></div>
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                        </div>
                        <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : visibleLawyers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p className="text-sm">No suggestions available</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchSuggestedLawyers}
                      className="mt-2 text-xs"
                    >
                      Try refreshing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {visibleLawyers.map((lawyer) => {
                        // Determine button state based on connection status
                        const getButtonConfig = () => {
                          if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'sent') {
                            return {
                              text: 'Cancel',
                              className: 'border-red-600 text-red-600',
                              action: 'cancel',
                              connectionId: lawyer.connectionId
                            }
                          } else if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'received') {
                            return {
                              text: 'Respond',
                              className: 'border-green-600 text-green-600',
                              action: 'respond',
                              connectionId: lawyer.connectionId
                            }
                          } else {
                            return {
                              text: 'Connect',
                              className: 'border-blue-600 text-blue-600',
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
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ 
                              opacity: 0, 
                              y: -50, 
                              scale: 0.8,
                              transition: { duration: 0.4, ease: "easeInOut" }
                            }}
                            transition={{ 
                              duration: 0.5, 
                              ease: "easeOut",
                              layout: { duration: 0.3 }
                            }}
                            className="flex items-center space-x-3"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={lawyer.ProfileImage?.imagePath || lawyer.profilePicture} 
                                alt={`${lawyer.firstName}'s Profile`}
                              />
                              <AvatarFallback className="bg-blue-600 text-white">
                                {`${lawyer.firstName?.[0] || ''}${lawyer.lastName?.[0] || ''}`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate text-foreground">
                                {lawyer.firstName} {lawyer.lastName}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {lawyer.Lawyer?.lawFirm || 'Legal Professional'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs transition-all duration-200 ${buttonConfig.className}`}
                              data-user-id={lawyer.id}
                              data-action={buttonConfig.action}
                              data-connection-id={buttonConfig.connectionId}
                              onClick={(e) => handleButtonClick(e.target)}
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