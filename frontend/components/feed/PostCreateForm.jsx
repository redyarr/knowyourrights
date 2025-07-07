"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { toast } from "sonner"
import { 
  Plus, 
  Image as ImageIcon, 
  Tag, 
  Gavel, 
  Scale, 
  Handshake,
  Camera,
  X,
  AlertTriangle
} from 'lucide-react'

const PostCreateForm = ({ userData, onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const getUserInitials = () => {
    if (!userData) return 'U'
    return `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase()
  }

  const categories = [
    { value: 'General', icon: Scale, label: 'General Legal', color: 'text-blue-600' },
    { value: 'Case Study', icon: Gavel, label: 'Case Study', color: 'text-green-600' },
    { value: 'Legal Tip', icon: Scale, label: 'Legal Tip', color: 'text-purple-600' },
    { value: 'Consultation', icon: Handshake, label: 'Consultation', color: 'text-orange-600' }
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast("File Too Large", {
          description: "Please select an image smaller than 5MB"
        })
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast("Missing Information", {
        description: "Please provide both title and content"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      formData.append('category', category)
      
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const response = await fetch('http://localhost:3001/feed/create-post', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        toast("Post Created", {
          description: "Your legal insight has been shared successfully"
        })
        
        // Reset form
        setTitle('')
        setContent('')
        setCategory('General')
        removeFile()
        setIsOpen(false)
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated(data.post)
        }
      } else {
        toast("Post Failed", {
          description: data?.error?.message
        })
      }
    } catch (error) {
      console.error('Post creation error:', error)
      toast("Network Error", {
        description: "Failed to create post. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userData || userData.role !== 'lawyer') {
    return null
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData.profilePicture} alt="Profile" />
              <AvatarFallback className="bg-blue-600 text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <div className="relative w-full">
                  <Button
                    variant="outline"
                    disabled={userData?.lawyerVerivicationStatus !== 'approved'}
                    className={`w-full flex-1 justify-start text-muted-foreground hover:bg-muted/50 ${
                      userData?.lawyerVerivicationStatus !== 'approved' 
                        ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' 
                        : ''
                    }`}
                  >
                    {userData?.lawyerVerivicationStatus !== 'approved' ? (
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        Verification required to post...
                      </div>
                    ) : (
                      'Share legal insights...'
                    )}
                  </Button>
                  
                  
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span>Share Legal Insights</span>
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className='space-y-2'>
                    <Label htmlFor="title">Article Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Understanding Employment Rights"
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="content">Legal Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your legal expertise and insights..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          type="button"
                          variant={category === cat.value ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setCategory(cat.value)}
                        >
                          <cat.icon className={`h-4 w-4 mr-2 ${cat.color}`} />
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Supporting Image (optional)</Label>
                    <div className="mt-2">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click to add an image
                            </span>
                          </div>
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sharing...' : 'Share Insights'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                size="sm"
                className={`flex items-center sm:space-x-2 md:space-x-0 xl:space-x-2 hover:bg-muted/50 ${
                  userData?.lawyerVerivicationStatus !== 'approved' 
                    ? 'opacity-60 cursor-not-allowed' 
                    : ''
                }`}
                disabled={userData?.lawyerVerivicationStatus !== 'approved'}
                onClick={() => {
                  if (userData?.lawyerVerivicationStatus === 'approved') {
                    setCategory(cat.value)
                    setIsOpen(true)
                  }
                }}
              >
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                <span className="sm:text-sm md:text-xs xl:text-sm font-medium text-xs sm:inline">
                  {cat.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default PostCreateForm
