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
  Hash,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [showImageUpload, setShowImageUpload] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First get the current user data from the cookie/session
      const userResponse = await fetch('/api/getuserdata', {
        credentials: 'include'
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user session')
      }
      
      const userData = await userResponse.json()
      
      if (!userData.success || !userData.payload) {
        throw new Error('No user session found')
      }
      
      const userId = userData.payload.id
      
      // Now fetch the full profile data from the backend using the profile route
      const profileResponse = await fetch(`http://localhost:3001/in/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      // Since the backend route renders a view, we need to fetch profile data differently
      // Let's use the user data we already have and enhance it
      const currentUserData = userData.payload
      
      // Create a complete profile object from the user data
      const enhancedProfile = {
        id: currentUserData.id,
        firstName: currentUserData.firstName,
        lastName: currentUserData.lastName,
        email: currentUserData.email,
        role: currentUserData.role,
        country: currentUserData.country,
        city: currentUserData.city,
        interests: currentUserData.interests,
        profilePicture: currentUserData.profilePicture,
        headline: currentUserData.headline,
        createdAt: currentUserData.createdAt,
        // Add lawyer data if user is a lawyer
        lawyer: currentUserData.lawyer || null,
        // Add mock data for demonstration
        posts: [],
        connectionsCount: 156,
        profileViews: 12,
        postImpressions: 1204
      }
      
      setProfileData(enhancedProfile)
      setConnectionsCount(enhancedProfile.connectionsCount)
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error.message)
      toast("Error Loading Profile", {
        description: error.message || "Failed to load your profile"
      })
    } finally {
      setLoading(false)
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
    
    const status = profileData.lawyer.verificationStatus || profileData.lawyer.badgeIssuingAuthority
    
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
      case 'consultant':
        return {
          label: 'Legal Consultant',
          icon: Award,
          color: 'text-purple-600 bg-purple-100 border-purple-200'
        }
      case 'training':
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100 border-blue-200'
        }
      default:
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100 border-blue-200'
        }
    }
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
                  <AvatarImage src={profileData?.profilePicture} alt={getUserDisplayName()} />
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Upload a new profile picture</p>
                      <input type="file" accept="image/*" className="hidden" id="profile-upload" />
                      <Button asChild>
                        <label htmlFor="profile-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
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
                
                {profileData?.headline && (
                  <p className="text-muted-foreground mt-1">
                    {profileData.headline}
                  </p>
                )}
              </div>
              
              {profileData?.city && profileData?.country && (
                <div className="flex items-center justify-center sm:justify-start text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 me-2" />
                  <span>{profileData.city}, {profileData.country}</span>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{connectionsCount}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profileData?.profileViews || 0}</div>
                  <div className="text-sm text-muted-foreground">Profile Views</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{profileData?.postImpressions || 0}</div>
                  <div className="text-sm text-muted-foreground">Post Views</div>
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
                        
                        <div className="flex items-center text-muted-foreground">
                          <Building className="h-4 w-4 me-2" />
                          <span>{profileData.lawyer.lawFirm}</span>
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
                      My Posts
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No posts yet.</p>
                      {profileData?.role === 'lawyer' && (
                        <Button asChild className="mt-4">
                          <Link href="/">Create your first post</Link>
                        </Button>
                      )}
                    </div>
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
                  
                  {profileData.lawyer?.badgeNumber && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">Badge Number</p>
                      <p className="text-sm font-mono bg-background px-2 py-1 rounded mt-1">
                        {profileData.lawyer.badgeNumber}
                      </p>
                    </div>
                  )}
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