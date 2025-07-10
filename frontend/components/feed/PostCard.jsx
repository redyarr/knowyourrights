"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { toast } from "sonner"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Laugh, 
  Frown, 
  Angry,
  Sparkles,
  MoreHorizontal,
  Edit3,
  Trash2,
  Globe,
  Clock,
  GraduationCap,
  XCircle,
  ShieldCheck,
  X,
  AlertTriangle,
  Eye,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  UserPlus,
  UserCheck
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"

const PostCard = ({ post, userData, onPostUpdate, observerRef }) => {
  
  const [showComments, setShowComments] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title || '')
  const [editContent, setEditContent] = useState(post.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState(null)
  const [showFullContent, setShowFullContent] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [connectionId, setConnectionId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const modalRef = useRef(null)
  const commentInputRef = useRef(null)

  const calculateReactionStats = (reactsArray) => {
    const stats = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
    
    if (reactsArray && Array.isArray(reactsArray)) {
      reactsArray.forEach(react => {
        if (stats.hasOwnProperty(react.reaction)) {
          stats[react.reaction]++
        }
      })
    }
    
    return stats
  }
  
  // Initialize reactions by calculating from reacts array
  const initialReactionStats = calculateReactionStats(post.reacts || [])
  
  const [reactions, setReactions] = useState(initialReactionStats)
  const [userReaction, setUserReaction] = useState(post.userReaction)
  const [comments, setComments] = useState(post.comments || [])
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const reactionEmojis = {
    like: { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    love: { emoji: '❤️', icon: Heart, label: 'Love' },
    haha: { emoji: '😂', icon: Laugh, label: 'Haha' },
    wow: { emoji: '😮', icon: Sparkles, label: 'Wow' },
    sad: { emoji: '😢', icon: Frown, label: 'Sad' },
    angry: { emoji: '😠', icon: Angry, label: 'Angry' }
  }

  const getUserInitials = (user) => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User'
    return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getLawyerAuthority = (lawyer) => {
    
    switch (lawyer) {
      case 'approved':
        return {
          label: 'Approved',
          icon: ShieldCheck,
          color: 'text-yellow-600 bg-yellow-100'
        }
      case 'consultant':
        return {
          label: 'Consultant',
          icon: Clock,
          color: 'text-purple-600 bg-purple-100'
        }
      case 'training':
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100'
        }
      default:
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100'
        }
    }
  }

  
  const handleReaction = async (reactionType) => {
    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction: reactionType }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setReactions(data.reactionStats)
        setUserReaction(data.userReaction)
        setShowReactionPicker(false)
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

  const handleComment = async (e) => {
    e.preventDefault()
    const content = commentInputRef.current.value.trim()
    
    if (!content) return

    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        // Add the new comment to the comments list
        setComments([...comments, data.comment])
        commentInputRef.current.value = ''
        setShowCommentForm(false)
        setShowComments(true)
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
        // Update the comment in the comments list
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editCommentContent.trim() }
            : comment
        ))
        setEditingCommentId(null)
        setEditCommentContent('')
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
        // Remove the comment from the comments list
        setComments(prev => prev.filter(comment => comment.id !== commentId))
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

  const handleShare = async () => {
    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/share`, {
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

  const handleEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast("Missing Information", {
        description: "Please provide both title and content"
      })
      return
    }

    setIsEditing(true)

    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim()
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast("Post Updated", {
          description: "Your post has been updated successfully"
        })
        
        // Update the post in the parent component
        const updatedPost = {
          ...post,
          title: editTitle.trim(),
          content: editContent.trim()
        }
        
        if (onPostUpdate) {
          onPostUpdate(updatedPost)
        }
        
        setShowEditDialog(false)
      } else {
        toast("Update Failed", {
          description: data.error || "Failed to update post"
        })
      }
    } catch (error) {
      console.error('Edit post error:', error)
      toast("Network Error", {
        description: "Failed to update post. Please try again."
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeletePost = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast("Post Deleted", {
          description: "Your post has been deleted successfully"
        })
        
        // Remove the post from the parent component by updating with null
        if (onPostUpdate) {
          onPostUpdate(null, post.id)
        }
      } else {
        toast("Delete Failed", {
          description: data.error || "Failed to delete post"
        })
      }
    } catch (error) {
      console.error('Delete post error:', error)
      toast("Network Error", {
        description: "Failed to delete post. Please try again."
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc)
    setShowImageModal(true)
    setNewComment('')
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage(null)
    setNewComment('')
  }

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeImageModal()
      }
    }

    if (showImageModal) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeImageModal()
        }
      })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', closeImageModal)
    }
  }, [showImageModal])

  const handleModalComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`http://localhost:3001/feed/post/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setComments([...comments, data.comment])
        setNewComment('')
      } else {
        toast("Comment Failed", {
          description: data.error || "Failed to post comment"
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to post comment"
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Calculate total reactions - this should work immediately with seeded data
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const Authority = getLawyerAuthority(post?.user?.lawyer?.badgeIssuingAuthority)
  
  const handleReactionHover = (show) => {
    if (reactionPickerTimeout) {
      clearTimeout(reactionPickerTimeout)
      setReactionPickerTimeout(null)
    }
    
    if (show) {
      setShowReactionPicker(true)
    } else {
      // Add 500ms delay before hiding the picker
      const timeout = setTimeout(() => {
        setShowReactionPicker(false)
      }, 300) // Half a second delay
      setReactionPickerTimeout(timeout)
    }
  }

  const handleReactionPickerMouseEnter = () => {
    // Clear any pending timeout when mouse enters the picker
    if (reactionPickerTimeout) {
      clearTimeout(reactionPickerTimeout)
      setReactionPickerTimeout(null)
    }
  }

  const handleReactionPickerMouseLeave = () => {
    // Add delay when leaving the picker too
    const timeout = setTimeout(() => {
      setShowReactionPicker(false)
    }, 300) // Half a second delay
    setReactionPickerTimeout(timeout)
  }

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (reactionPickerTimeout) {
        clearTimeout(reactionPickerTimeout)
      }
    }
  }, [reactionPickerTimeout])

  

  // Handle connection request
  const handleConnectionRequest = async () => {
    if (!userData || post.authorId === userData.id) return

    setIsConnecting(true)

    try {
      const response = await fetch(`http://localhost:3001/mynetwork/connect/${post.authorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast("Connection Request Sent", {
          description: `Your connection request has been sent to ${getUserDisplayName(post.user)}`
        })
        
        setConnectionStatus('pending')
        setConnectionId(data.connectionId)
      } else {
        toast("Request Failed", {
          description: data.message || "Failed to send connection request"
        })
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Network Error", {
        description: "Failed to send connection request. Please try again."
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle cancel connection request
  const handleCancelRequest = async () => {
    if (!connectionId) return
    setIsConnecting(true)

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
        
        setConnectionStatus(null)
        setConnectionId(null)
      } else {
        toast("Cancel Failed", {
          description: data.message || "Failed to cancel connection request"
        })
      }
    } catch (error) {
      console.error('Cancel request error:', error)
      toast("Network Error", {
        description: "Failed to cancel request. Please try again."
      })
    } finally {
      setIsConnecting(false)
    }
  }

  console.log('PostCard rendered for post:', post);
  

  // Render connection button
  const renderConnectionButton = () => {
    // Don't show connect button for own posts or if user not logged in
    if (!userData || post.authorId === userData.id) return null

    // Check if already connected
    if (connectionStatus === 'accepted') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
          disabled
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Connected
        </Button>
      )
    }

    // If pending request sent by current user
    if (connectionStatus === 'pending') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleCancelRequest}
          disabled={isConnecting}
        >
          <X className="h-4 w-4 mr-2" />
          {isConnecting ? 'Cancelling...' : 'Cancel'}
        </Button>
      )
    }

    // Default connect button
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
        onClick={handleConnectionRequest}
        disabled={isConnecting}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    )
  }

  const isContentLong = post.content && post.content.length > 246 // Adjust threshold as needed

  return (
    <>
      <Card className="w-full pt-2 pb-1 rounded-md" ref={observerRef}>
        <CardHeader className="">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Link href={`/in/${post.user?.id || '#'}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.user?.profilePicture} alt="Profile" />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getUserInitials(post.user)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Link
                    href={`/profile/${post.user?.id || '#'}`}
                    className="font-semibold hover:text-blue-600 hover:underline transition-colors"
                  >
                    {getUserDisplayName(post.user)}
                  </Link>
                  
                  {/* Verification Badge for Lawyers */}
                  {post?.user?.role === 'lawyer' && Authority && (
                    <Badge variant="secondary" className={`text-xs ${Authority.color}`}>
                      <Authority.icon className="h-3 w-3 mr-1" />
                      {Authority.label}
                    </Badge>
                  )}
                </div>
                
                {/* Law Firm */}
                {post.user?.role === 'lawyer' && post.user?.lawyer?.lawFirm && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {post?.user?.lawyer?.lawFirm}
                  </p>
                )}
                
                {/* User Headline */}
                {post.user?.headline && (
                  <p className="text-xs text-muted-foreground">
                    {post.user.headline}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <time>{formatDate(post.createdAt)}</time>
                </div>
              </div>
            </div>
            
            {/* Three-dot menu for post owner */}
            {userData && post.authorId === userData.id ?
             (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={() => {
                      setEditTitle(post.title || '')
                      setEditContent(post.content || '')
                      setShowEditDialog(true)
                    }}
                    className="cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
            :
            (
              renderConnectionButton()
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {/* Post Content */}
          {post.title && (
            <h2 className="font-semibold text-lg mb-3 leading-tight px-6">
              {post.title}
            </h2>
          )}
          
          <div className="text-sm leading-relaxed mb-4 px-6">
            <div className="max-h-none">
              <p className="whitespace-pre-wrap break-words">
                {showFullContent || !isContentLong 
                  ? post.content 
                  : `${post.content.substring(0, 200)} `
                }
                {isContentLong && !showFullContent && (
                  <span className="text-gray-500">
                     ...
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="text-gray-500 hover:text-gray-700 font-medium ml-1 transition-colors"
                    >
                      more
                    </button>
                  </span>
                )}
              </p>
              {isContentLong && showFullContent && (
                <button
                  onClick={() => setShowFullContent(false)}
                  className="text-gray-500 hover:text-gray-700 font-medium mt-2 text-sm transition-colors"
                >
                  show less
                </button>
              )}
            </div>
          </div>

          {/* Post Images */}
          {post.post_photos && post.post_photos.length > 0 && (
            <div className="">
              {post.post_photos.length === 1 ? (
                <div className="relative">
                  <img
                    src={post.post_photos[0].photo.photoPath}
                    alt="Post image"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => handleImageClick(post.post_photos[0].photo.photoPath)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.post_photos.map((postPhoto, index) => (
                    <img
                      key={index}
                      src={postPhoto.photo.photoPath}
                      alt="Post image"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(postPhoto.photo.photoPath)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALWAYS show reaction stats section if there are ANY reactions or comments */}
          {(totalReactions > 0 || comments.length > 0) ? 
          (
            <div className="flex items-center justify-between pt-2 px-6">
              {/* Reactions display */}
              {totalReactions > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {topReactions.map(([reaction]) => (
                      <span
                        key={reaction}
                        className="inline-flex items-center justify-center w-4 h-4 text-sm  rounded-full shadow-sm"
                      >
                        {reactionEmojis[reaction]?.emoji}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {totalReactions}
                  </span>
                </div>
              )}
              
              {/* Comments display */}
              {comments.length > 0 && (
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground p-0 h-auto"
                  onClick={() => setShowComments(!showComments)}
                >
                  {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          ) 
          :
           <div className='pt-2'>
              <div className='w-4 h-4'>
              </div>
           </div>
           }

          <Separator className="my-2" />

          {/* Action Buttons */}
          <div className="flex items-center justify-around">
            <div className="relative">
              <Button
                variant="ghost"
                className={`flex items-center space-x-2 ${userReaction ? 'text-blue-600' : ''}`}
                onMouseEnter={() => handleReactionHover(true)}
                onMouseLeave={() => handleReactionHover(false)}
                onClick={() => handleReaction('like')}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {userReaction ? userReaction.charAt(0).toUpperCase() + userReaction.slice(1) : 'Like'}
                </span>
              </Button>
              
              {/* Reaction Picker */}
              {showReactionPicker && (
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-popover border rounded-lg shadow-xl p-2 z-50"
                  onMouseEnter={handleReactionPickerMouseEnter}
                  onMouseLeave={handleReactionPickerMouseLeave}
                >
                  <div className="flex space-x-1">
                    {Object.entries(reactionEmojis).map(([key, { emoji, label }]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        className="text-lg hover:scale-110 transition-transform p-1 h-auto"
                        onClick={() => handleReaction(key)}
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
              className="flex items-center space-x-2"
              onClick={() => {
                setShowComments(!showComments)
                setShowCommentForm(!showCommentForm)
                if (!showCommentForm) {
                  setTimeout(() => commentInputRef.current?.focus(), 100)
                }
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comment</span>
            </Button>

            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">Share</span>
            </Button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <div className="mt-4 mb-2 pt-4 border-t px-6">
              <form onSubmit={handleComment} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.profilePicture} alt="Your avatar" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {getUserInitials(userData)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    ref={commentInputRef}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    Post
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Comments */}
          {showComments && comments.length > 0 && (
            <div className="mt-4 pb-1 pt-4 border-t space-y-3 px-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={comment.User?.profilePicture || comment.user?.profilePicture} 
                      alt="Commenter" 
                    />
                    <AvatarFallback className="bg-gray-500 text-white text-xs">
                      {getUserInitials(comment.User || comment.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {editingCommentId === comment.id ? (
                      // Edit comment form
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
                      // Display comment
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {getUserDisplayName(comment.User || comment.user)}
                          </div>
                          {/* Comment actions for comment author */}
                          {userData && comment.userId === userData.id && (
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
                      <span>{formatDate(comment.createdAt)}</span>
                      <Button variant="ghost" className="p-0 h-auto text-xs">
                        Like
                      </Button>
                      <Button variant="ghost" className="p-0 h-auto text-xs">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <span>Edit Post</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleEditPost}
                disabled={isEditing}
                className="flex-1"
              >
                {isEditing ? 'Updating...' : 'Update Post'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isEditing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will permanently remove your post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LinkedIn-Style Image Modal with Dark Mode Support */}
      {showImageModal && selectedImage && (
        <div className="fixed overflow-auto inset-0 bg-black/75 dark:bg-black/85 z-[100] flex items-center justify-center p-2 md:p-4">
          <div 
            ref={modalRef}
            className="w-full h-full max-w-6xl max-h-[95vh] md:h-[90vh] bg-background dark:bg-background rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-border dark:border-border"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeImageModal}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 rounded-full bg-background/80 dark:bg-background/80 backdrop-blur-sm hover:bg-background dark:hover:bg-background border border-border dark:border-border shadow-lg"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Image Section - Top on mobile, Left on desktop */}
            <div className="flex-1 z-0 bg-muted/20 dark:bg-muted/10 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-border dark:border-border h-1/2 md:h-full">
              <img
                src={selectedImage}
                alt="Post image"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Navigation Arrows for Multiple Images */}
              {post.post_photos && post.post_photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      const currentIndex = post.post_photos.findIndex(photo => photo.photo.photoPath === selectedImage)
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : post.post_photos.length - 1
                      setSelectedImage(post.post_photos[prevIndex].photo.photoPath)
                    }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 dark:bg-background/80 backdrop-blur-sm hover:bg-background dark:hover:bg-background border border-border dark:border-border shadow-lg"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      const currentIndex = post.post_photos.findIndex(photo => photo.photo.photoPath === selectedImage)
                      const nextIndex = currentIndex < post.post_photos.length - 1 ? currentIndex + 1 : 0
                      setSelectedImage(post.post_photos[nextIndex].photo.photoPath)
                    }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 dark:bg-background/80 backdrop-blur-sm hover:bg-background dark:hover:bg-background border border-border dark:border-border shadow-lg"
                  >
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Post Details Section - Bottom on mobile, Right on desktop */}
            <div className="w-full overflow-auto md:w-96 bg-background dark:bg-background flex flex-col h-1/2 md:h-full">
              {/* Post Header */}
              <div className="p-3 md:p-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src={post.user?.profilePicture} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(post.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-foreground dark:text-foreground">
                        {getUserDisplayName(post.user)}
                      </h3>
                      {post?.user?.role === 'lawyer' && Authority && (
                        <Badge variant="secondary" className={`text-xs ${Authority.color}`}>
                          <Authority.icon className="h-3 w-3 mr-1" />
                          {Authority.label}
                        </Badge>
                      )}
                    </div>
                    {post.user?.role === 'lawyer' && post.user?.lawyer?.lawFirm && (
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {post.user.lawyer.lawFirm}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <time>{formatDate(post.createdAt)}</time>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content - Show full content on mobile too */}
              <div className="hidden md:block p-3 md:p-4 flex-shrink-0">
                {post.title && (
                  <h2 className="font-semibold text-sm md:text-base mb-2 text-foreground dark:text-foreground">
                    {post.title}
                  </h2>
                )}
                <div className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed max-h-32 md:max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-wrap break-words">
                    {showFullContent || !isContentLong 
                  ? post.content 
                  : `${post.content.substring(0, 200)} `
                }
                {isContentLong && !showFullContent && (
                  <span className="text-gray-500">
                     ...
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="text-gray-500 hover:text-gray-700 font-medium ml-1 transition-colors"
                    >
                      more
                    </button>
                  </span>
                )}
              </p>
              {isContentLong && showFullContent && (
                <button
                  onClick={() => setShowFullContent(false)}
                  className="text-gray-500 hover:text-gray-700 font-medium mt-2 text-sm transition-colors"
                >
                  show less
                </button>
              )}
                </div>
              </div>

              {/* Reactions and Stats */}
              <div className="px-3 md:px-4 py-2 md:py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {/* Reactions Display */}
                  {totalReactions > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        {topReactions.map(([reaction]) => (
                          <span
                            key={reaction}
                            className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-xs md:text-sm bg-background dark:bg-background border-2 border-background dark:border-background rounded-full shadow-sm"
                          >
                            {reactionEmojis[reaction]?.emoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground font-medium">
                        {totalReactions}
                      </span>
                    </div>
                  )}
                  
                  {/* Comment Count */}
                  {comments.length > 0 && (
                    <span className="text-xs md:text-sm text-muted-foreground dark:text-muted-foreground font-medium">
                      {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center border-t border-border dark:border-border justify-around mt-2 md:mt-3 pt-2 md:pt-3">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-1 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground ${userReaction ? 'text-primary dark:text-primary' : ''} px-2 md:px-3`}
                      onMouseEnter={() => handleReactionHover(true)}
                      onMouseLeave={() => handleReactionHover(false)}
                      onClick={() => handleReaction('like')}
                    >
                      <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs hidden sm:inline">
                        {userReaction ? userReaction.charAt(0).toUpperCase() + userReaction.slice(1) : 'Like'}
                      </span>
                    </Button>
                    
                    {/* Reaction Picker */}
                    {showReactionPicker && (
                      <div
                        className="absolute bottom-full left-[86px] mb-2 transform -translate-x-1/2 bg-popover dark:bg-popover border border-border dark:border-border rounded-lg shadow-xl p-2 z-50"
                        onMouseEnter={handleReactionPickerMouseEnter}
                        onMouseLeave={handleReactionPickerMouseLeave}
                      >
                        <div className="flex space-x-1">
                          {Object.entries(reactionEmojis).map(([key, { emoji, label }]) => (
                            <Button
                              key={key}
                              variant="ghost"
                              className="text-base md:text-lg hover:scale-110 transition-transform p-1 h-auto"
                              onClick={() => handleReaction(key)}
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
                    size="sm"
                    className="flex items-center space-x-1 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground px-2 md:px-3"
                    onClick={() => document.getElementById('modal-comment-input')?.focus()}
                  >
                    <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs hidden sm:inline">Comment</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground px-2 md:px-3"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>

              {/* Comment Input */}
              <div className="px-3 md:px-4 flex-shrink-0">
                <form onSubmit={handleModalComment} className="flex items-center space-x-2 md:space-x-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarImage src={userData?.profilePicture} alt="Your avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials(userData)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center space-x-1 md:space-x-2">
                    <Input
                      id="modal-comment-input"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-background dark:bg-background border-input dark:border-input text-xs md:text-sm h-8 md:h-10"
                      disabled={isSubmittingComment}
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="px-2 md:px-3 h-8 md:h-10"
                    >
                      {isSubmittingComment ? (
                        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-primary-foreground"></div>
                      ) : (
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center text-muted-foreground dark:text-muted-foreground text-xs md:text-sm py-4 md:py-8">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2 md:space-x-3">
                        <Avatar className="h-6 w-6 md:h-8 md:w-8">
                          <AvatarImage 
                            src={comment.User?.profilePicture || comment.user?.profilePicture} 
                            alt="Commenter" 
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {getUserInitials(comment.User || comment.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {editingCommentId === comment.id ? (
                            // Edit comment form
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="min-h-[50px] md:min-h-[60px] text-xs md:text-sm bg-background dark:bg-background border-input dark:border-input"
                                placeholder="Edit your comment..."
                              />
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={!editCommentContent.trim()}
                                  className="text-xs"
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelEditingComment}
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Display comment
                            <div className="bg-muted/50 dark:bg-muted/30 rounded-lg px-2 md:px-3 py-1.5 md:py-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-xs md:text-sm text-foreground dark:text-foreground">
                                  {getUserDisplayName(comment.User || comment.user)}
                                </div>
                                {userData && comment.userId === userData.id && (
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 md:h-6 md:w-6 p-0 text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary"
                                      onClick={() => startEditingComment(comment.id, comment.content)}
                                    >
                                      <Edit3 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 md:h-6 md:w-6 p-0 text-muted-foreground dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive"
                                      onClick={() => handleDeleteComment(comment.id)}
                                    >
                                      <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs md:text-sm mt-1 text-foreground dark:text-foreground">{comment.content}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-3 md:space-x-4 mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                            <span>{formatDate(comment.createdAt)}</span>
                            <Button variant="ghost" className="p-0 h-auto text-xs hover:text-primary dark:hover:text-primary">
                              Like
                            </Button>
                            <Button variant="ghost" className="p-0 h-auto text-xs hover:text-primary dark:hover:text-primary">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Image Counter for Multiple Images */}
              {post.post_photos && post.post_photos.length > 1 && (
                <div className="p-2 md:p-3 border-t border-border dark:border-border bg-muted/30 dark:bg-muted/20 flex-shrink-0">
                  <div className="text-center text-xs md:text-sm text-muted-foreground dark:text-muted-foreground">
                    {post.post_photos.findIndex(photo => photo.photo.photoPath === selectedImage) + 1} of {post.post_photos.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}



export default PostCard
