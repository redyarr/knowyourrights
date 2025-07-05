"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Input } from "../ui/input"
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
  ShieldCheck
} from 'lucide-react'

const PostCard = ({ post, userData, onPostUpdate, observerRef }) => {
  console.log('PostCard rendered with post:', post);
    
  const [showComments, setShowComments] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [reactions, setReactions] = useState(post.reactionStats || {})
  const [userReaction, setUserReaction] = useState(post.userReaction)
  const [comments, setComments] = useState(post.Comments || [])
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
        setComments([...comments, data.comment])
        commentInputRef.current.value = ''
        setShowCommentForm(false)
        setShowComments(true)
        
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

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0)
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const verificationBadge = getLawyerVerificationBadge(post?.user?.lawyer?.verificationStatus)

  return (
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
                {post.user?.role === 'lawyer' && verificationBadge && (
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
          
          {userData && post.authorId === userData.id && (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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

        {/* Reaction Stats */}
        {totalReactions > 0 && (
          <div className="flex items-center justify-between py-2">
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
              <span className="text-sm font-medium">Like</span>
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
                  <AvatarImage src={comment.User?.profilePicture} alt="Commenter" />
                  <AvatarFallback className="bg-gray-500 text-white text-xs">
                    {getUserInitials(comment.User)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="font-medium text-sm">
                      {getUserDisplayName(comment.User)}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
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
  )
}

export default PostCard
