"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
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
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  X,
  TrendingUp,
  Eye,
  Crown,
  Hash,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const SingleUserProfile = () => {
  const params = useParams()
  const userId = params.id
  const [profileData, setProfileData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchCurrentUser()
    }
  }, [userId])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/getuserdata', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCurrentUser(data.payload)
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First get the current user data from the cookie/session for comparison
      const userResponse = await fetch('/api/getuserdata', {
        credentials: 'include'
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.success) {
          setCurrentUser(userData.payload)
        }
      }
      
      // Try to fetch from backend API first, if it fails, use seed data
      try {
        const profileResponse = await fetch(`http://localhost:3001/in/${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        
        // If backend returns JSON, use it
        if (profileResponse.ok && profileResponse.headers.get('content-type')?.includes('application/json')) {
          const profileData = await profileResponse.json()
          
          if (profileData.success && profileData.user) {
            setProfileData(profileData.user)
            setConnectionsCount(profileData.connectionsCount || 0)
            
            if (profileData.connectionStatus) {
              setConnectionStatus(profileData.connectionStatus)
              setConnectionId(profileData.connectionId)
            }
            return; // Exit early if successful
          }
        }
      } catch (apiError) {
        console.log('API fetch failed, falling back to seed data:', apiError)
      }
      
      // Fallback to seed data structure
      const users = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'visitor', country: 'USA', city: 'New York' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'lawyer', country: 'USA', city: 'Los Angeles' },
        { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', role: 'admin', country: 'USA', city: 'Chicago' },
        { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', role: 'visitor', country: 'Canada', city: 'Toronto' },
        { id: 5, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', role: 'lawyer', country: 'Canada', city: 'Vancouver' },
        { id: 6, firstName: 'Dana', lastName: 'Miller', email: 'dana.miller@example.com', role: 'admin', country: 'UK', city: 'London' },
        { id: 7, firstName: 'Evan', lastName: 'Wilson', email: 'evan.wilson@example.com', role: 'visitor', country: 'UK', city: 'Manchester' },
        { id: 8, firstName: 'Fiona', lastName: 'Moore', email: 'fiona.moore@example.com', role: 'lawyer', country: 'Australia', city: 'Sydney' },
        { id: 9, firstName: 'George', lastName: 'Taylor', email: 'george.taylor@example.com', role: 'admin', country: 'Australia', city: 'Melbourne' },
        { id: 10, firstName: 'Hannah', lastName: 'Anderson', email: 'hannah.anderson@example.com', role: 'visitor', country: 'Germany', city: 'Berlin' },
        { id: 11, firstName: 'Aland', lastName: 'Othman', email: 'aland@gmail.com', role: 'lawyer', country: 'France', city: 'Paris' },
        { id: 12, firstName: 'Redyar', lastName: 'Hawzhin', email: 'redyar@gmail.com', role: 'visitor', country: 'Spain', city: 'Madrid' }
      ]

      const lawyers = [
        { userId: 2, lawFirm: 'Smith & Associates Law Firm', badgeNumber: 'LN1002', verificationStatus: 'approved', badgeIssuingAuthority: 'approved', summary: 'Expert in corporate law with over 10 years of experience.' },
        { userId: 5, lawFirm: 'Davis Legal Group', badgeNumber: 'LN1005', verificationStatus: 'consultant', badgeIssuingAuthority: 'consultant', summary: 'Specialized in intellectual property and business law.' },
        { userId: 8, lawFirm: 'Moore & Partners', badgeNumber: 'LN1008', verificationStatus: 'training', badgeIssuingAuthority: 'training', summary: 'Experienced in family and employment law.' },
        { userId: 11, lawFirm: 'Othman Legal Services', badgeNumber: 'LN1011', verificationStatus: 'consultant', badgeIssuingAuthority: 'consultant', summary: 'Expert in international law and cross-border transactions.' }
      ]

      const profileImages = [
        { userId: 11, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQF9FvdZ1W1_9g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712227644410?e=1747267200&v=beta&t=gtyFT7KVD2DSofgabD6bc-_-F_F49OBRbRzSrjaDqZ0' },
        { userId: 12, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQFNmASyBMQboA/profile-displayphoto-shrink_100_100/B4DZRbZ7x9HYAU-/0/1736700313204?e=1747267200&v=beta&t=q6BItntvASBeWeEROT5ZIKQDQDqyFWd6VvINNk-3qPM' }
      ]

      // Find the user by ID
      const user = users.find(u => u.id === parseInt(userId))
      
      if (!user) {
        throw new Error('User not found')
      }

      // Find lawyer info if user is a lawyer
      const lawyerInfo = user.role === 'lawyer' ? lawyers.find(l => l.userId === user.id) : null
      
      // Find profile image
      const profileImage = profileImages.find(p => p.userId === user.id)

      // Create enhanced profile object with real data
      const enhancedProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        country: user.country,
        city: user.city,
        interests: user.interests || '',
        profilePicture: profileImage?.imagePath || null,
        headline: user.headline || (user.role === 'lawyer' ? 'Legal Professional' : 'Member'),
        createdAt: user.createdAt || new Date().toISOString(),
        // Add lawyer data if user is a lawyer
        lawyer: lawyerInfo || null,
        // Add mock posts
        posts: [],
        connectionsCount: Math.floor(Math.random() * 200) + 50,
        profileViews: Math.floor(Math.random() * 100) + 10,
        postImpressions: Math.floor(Math.random() * 2000) + 500
      }
      
      setProfileData(enhancedProfile)
      setConnectionsCount(enhancedProfile.connectionsCount)
      
      // Mock connection status (you can enhance this later with real backend data)
      if (currentUser && currentUser.id !== parseInt(userId)) {
        // Simulate different connection statuses for demo
        const statuses = [null, 'pending', 'accepted']
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        setConnectionStatus(randomStatus)
        if (randomStatus) {
          setConnectionId(Math.floor(Math.random() * 1000) + 1)
        }
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error.message)
      toast("Error Loading Profile", {
        description: error.message || "Failed to load profile"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnection = async (action) => {
    if (!currentUser || isConnecting) return
    
    setIsConnecting(true)
    
    try {
      let url
      let method = 'POST'
      
      if (action === 'connect') {
        url = `http://localhost:3001/mynetwork/connect/${userId}`
      } else if (action === 'cancel') {
        url = `http://localhost:3001/mynetwork/cancel/${connectionStatus?.connectionId}`
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (action === 'connect') {
          setConnectionStatus({ status: 'pending', connectionId: data.connectionId })
          toast("Connection Request Sent", {
            description: `Your connection request has been sent to ${getUserDisplayName()}`
          })
        } else if (action === 'cancel') {
          setConnectionStatus(null)
          toast("Request Cancelled", {
            description: "Your connection request has been cancelled"
          })
        }
      } else {
        toast("Request Failed", {
          description: data.message || "Please try again"
        })
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast("Network Error", {
        description: "Failed to process request. Please try again."
      })
    } finally {
      setIsConnecting(false)
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

  const isOwnProfile = currentUser?.id === parseInt(userId)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Profile Header Skeleton */}
          <Card className="mb-6">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start -mt-12 sm:-mt-16 mb-4">
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
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
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
            {isOwnProfile && (
              <div className="absolute top-4 end-4">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            )}
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
                {isOwnProfile && (
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
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 sm:mt-16 flex justify-center sm:justify-end">
                {isOwnProfile ? (
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
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Connection Button */}
                    {connectionStatus?.status === 'accepted' ? (
                      <Button disabled className="text-green-600 border-green-600">
                        <UserCheck className="h-4 w-4 me-2" />
                        Connected
                      </Button>
                    ) : connectionStatus?.status === 'pending' ? (
                      <Button
                        variant="outline"
                        onClick={() => handleConnection('cancel')}
                        disabled={isConnecting}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 me-2" />
                        {isConnecting ? 'Cancelling...' : 'Cancel Request'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnection('connect')}
                        disabled={isConnecting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-4 w-4 me-2" />
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                    
                    <Button variant="outline" asChild>
                      <Link href={`/messaging/${userId}`}>
                        <MessageCircle className="h-4 w-4 me-2" />
                        Message
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
              <TabsList className="grid w-full grid-cols-4">
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
                {profileData?.role === 'lawyer' && (
                  <TabsTrigger value="credentials" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span className="hidden sm:inline">Credentials</span>
                  </TabsTrigger>
                )}
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
                          <p className="font-medium">Posted a new article</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Connected with 3 new professionals</p>
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

                            {/* Post Images - Just like PostCard */}
                            {post.post_photos && post.post_photos.length > 0 && (
                              <div className="mb-4">
                                {post.post_photos.length === 1 ? (
                                  <div className="relative">
                                    <img
                                      src={post.post_photos[0].photo?.photoPath || post.post_photos[0].photoPath}
                                      alt="Post image"
                                      className="w-full h-auto object-contain max-h-96 cursor-pointer"
                                      onClick={() => setSelectedImage(post.post_photos[0].photo?.photoPath || post.post_photos[0].photoPath)}
                                    />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 px-4">
                                    {post.post_photos.slice(0, 4).map((postPhoto, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={postPhoto.photo?.photoPath || postPhoto.photoPath}
                                          alt="Post image"
                                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                          onClick={() => setSelectedImage(postPhoto.photo?.photoPath || postPhoto.photoPath)}
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
                                        <span className="text-sm bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center shadow-sm">👍</span>
                                        <span className="text-sm bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center shadow-sm">❤️</span>
                                      </div>
                                      <span className="font-medium">{post.reacts.length}</span>
                                    </div>
                                  )}
                                </div>
                                {post.comments && post.comments.length > 0 && (
                                  <span className="font-medium">{post.comments.length} comments</span>
                                )}
                              </div>
                            </div>

                            {/* Post Actions */}
                            <div className="px-4 py-3 border-t border-border">
                              <div className="flex items-center justify-around">
                                <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span className="text-sm font-medium">Like</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600">
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Comment</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600">
                                  <Share2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">Share</span>
                                </Button>
                              </div>
                            </div>
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
                      {/* Professional Status */}
                      <div className={`rounded-xl p-6 border-2 ${verificationBadge?.color.includes('green') ? 'bg-green-50 border-green-200' : verificationBadge?.color.includes('yellow') ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center me-4 ${verificationBadge?.color.includes('green') ? 'bg-green-600' : verificationBadge?.color.includes('yellow') ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                            {verificationBadge && <verificationBadge.icon className="h-6 w-6 text-white" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{verificationBadge?.label}</h4>
                            <p className="text-sm opacity-80">Professional Status</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* License Info */}
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
                  <Link href="/search">
                    <Eye className="h-4 w-4 me-2" />
                    Find People
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleUserProfile