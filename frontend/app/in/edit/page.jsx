"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Separator } from "../../../components/ui/separator"
import { Badge } from "../../../components/ui/badge"
import { toast } from "sonner"
import { 
  ArrowLeft,
  User,
  Building,
  MapPin,
  Save,
  Loader2,
  Edit3,
  Globe,
  GraduationCap,
  Award,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

const EditProfile = () => {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    interests: '',
    // Lawyer specific fields
    lawFirm: '',
    licenseNumber: '',
    summary: '',
    legalAreas: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get the current user data from the session
      const userResponse = await fetch('/api/getuserdata', {
        credentials: 'include'
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user session')
      }
      
      const sessionData = await userResponse.json()
      
      if (!sessionData.success || !sessionData.payload) {
        throw new Error('No user session found')
      }
      
      const user = sessionData?.payload?.id
      setUserData(user)
      
      // Populate form with existing data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || '',
        city: user.city || '',
        interests: user.interests || '',
        // Lawyer specific fields
        lawFirm: user.lawyer?.lawFirm || '',
        licenseNumber: user.lawyer?.badgeNumber || '',
        summary: user.lawyer?.summary || '',
        legalAreas: user.lawyer?.legalAreas || ''
      })
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast("Error", {
        description: "Failed to load profile data"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName) {
      toast("Validation Error", {
        description: "First name and last name are required"
      })
      return
    }
    
    setSaving(true)
    
    try {
      const response = await fetch(`http://localhost:3001/in/${userData.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      toast("Profile Updated", {
        description: "Your profile has been updated successfully"
      })
      
      // Redirect back to profile
      router.push(`/in/${userData.id}`)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast("Update Failed", {
        description: "Failed to update profile. Please try again."
      })
    } finally {
      setSaving(false)
    }
  }

  const getVerificationBadge = () => {
    if (userData?.role !== 'lawyer' || !userData.lawyer) return null
    
    const status = userData.lawyer.verificationStatus
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <Separator />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                  <p className="text-muted-foreground">Update your personal information and professional details</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/in/${userData?.id}`}>
                  <ArrowLeft className="h-4 w-4 me-2" />
                  Back
                </Link>
              </Button>
            </div>
            
            {verificationBadge && (
              <Badge variant="secondary" className={`${verificationBadge.color} flex items-center w-fit`}>
                <verificationBadge.icon className="h-4 w-4 me-2" />
                {verificationBadge.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <div className="flex items-center mb-6">
                  <User className="h-5 w-5 text-blue-600 me-2" />
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter your country"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Professional Information - Only for Lawyers */}
              {userData?.role === 'lawyer' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Building className="h-5 w-5 text-blue-600 me-2" />
                    <h2 className="text-lg font-semibold">Professional Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lawFirm">Law Firm</Label>
                      <Input
                        id="lawFirm"
                        value={formData.lawFirm}
                        onChange={(e) => handleInputChange('lawFirm', e.target.value)}
                        placeholder="Enter your law firm name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License/Badge Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="Enter your license number"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Tell us about your legal expertise and experience..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="legalAreas">Legal Areas of Expertise</Label>
                    <Textarea
                      id="legalAreas"
                      value={formData.legalAreas}
                      onChange={(e) => handleInputChange('legalAreas', e.target.value)}
                      placeholder="e.g., Family Law, Corporate Law, Criminal Defense..."
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple areas with commas</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Interests */}
              <div>
                <div className="flex items-center mb-6">
                  <Globe className="h-5 w-5 text-blue-600 me-2" />
                  <h2 className="text-lg font-semibold">Interests & Focus Areas</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interests">
                    {userData?.role === 'lawyer' ? 'Additional Legal Interests' : 'Legal Areas of Interest'}
                  </Label>
                  <Textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    placeholder={userData?.role === 'lawyer' 
                      ? "e.g., Pro Bono Work, Legal Education, Community Outreach..." 
                      : "e.g., Family Law, Employment Rights, Consumer Protection..."
                    }
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-muted-foreground">Separate multiple interests with commas</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <Button variant="outline" asChild className="sm:w-auto w-full">
                  <Link href={`/in/${userData?.id}`}>
                    Cancel
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="sm:w-auto w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditProfile