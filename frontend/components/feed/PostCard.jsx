"use client"

import { useState, useRef } from 'react'
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
  AlertTriangle
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"

const PostCard = ({ post, userData, onPostUpdate, observerRef }) => {
  console.log('Rendering PostCard for post:', post);
  
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
  const commentInputRef = useRef(null)

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

  const getLawyerVerificationBadge = (lawyer) => {
    
    switch (lawyer) {
      case 'approved':
        return {
          label: 'Verified',
          icon: ShieldCheck,
          color: 'text-green-600 bg-green-100'
        }
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          color: 'text-red-600 bg-red-100'
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

  // Calculate total reactions - this should work immediately with seeded data
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const verificationBadge = getLawyerVerificationBadge(post?.user?.lawyer?.verificationStatus)
  
  return (
    <>
      <Card className="w-full" ref={observerRef}>
        <CardHeader className="pb-3">
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
                  {post?.user?.role === 'lawyer' && verificationBadge && (
                    <Badge variant="secondary" className={`text-xs ${verificationBadge.color}`}>
                      <verificationBadge.icon className="h-3 w-3 mr-1" />
                      {verificationBadge.label}
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
                  <span>•</span>
                  <div className="flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    <span>Public</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Three-dot menu for post owner */}
            {userData && post.authorId === userData.id && (
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
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Post Content */}
          {post.title && (
            <h2 className="font-semibold text-lg mb-3 leading-tight">
              {post.title}
            </h2>
          )}
          
          <div className="text-sm leading-relaxed mb-4">
            <p>
              {post.content.length > 300 
                ? `${post.content.substring(0, 300)}...` 
                : post.content
              }
            </p>
            {post.content.length > 300 && (
              <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
                ...see more
              </Button>
            )}
          </div>

          {/* Post Images */}
          {post.post_photos && post.post_photos.length > 0 && (
            <div className="mb-4">
              {post.post_photos.length === 1 ? (
                <div className="relative">
                  <img
                    src={post.post_photos[0].photo.photoPath}
                    alt="Post image"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.post_photos.map((postPhoto, index) => (
                    <img
                      key={index}
                      src={postPhoto.photo.photoPath}
                      alt="Post image"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALWAYS show reaction stats section if there are ANY reactions or comments */}
          {(totalReactions > 0 || comments.length > 0) && (
            <div className="flex items-center justify-between py-2">
              {/* Reactions display */}
              {totalReactions > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {topReactions.map(([reaction]) => (
                      <span
                        key={reaction}
                        className="inline-flex items-center justify-center w-6 h-6 text-sm bg-white border-2 border-white rounded-full shadow-sm"
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
          )}

          <Separator className="my-3" />

          {/* Action Buttons */}
          <div className="flex items-center justify-around">
            <div className="relative">
              <Button
                variant="ghost"
                className={`flex items-center space-x-2 ${userReaction ? 'text-blue-600' : ''}`}
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
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
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
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
            <div className="mt-4 pt-4 border-t">
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
            <div className="mt-4 pt-4 border-t space-y-3">
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

          {/* Always show comment count if there are comments */}
          {comments.length > 0 && !showComments && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground p-0 h-auto"
                onClick={() => setShowComments(true)}
              >
                View {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </Button>
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
    </>
  )
}

export default PostCard
