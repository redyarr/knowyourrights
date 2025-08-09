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
  XCircle,
  AlertTriangle
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
      // Get the current user data using the profile endpoint
      const userResponse = await fetch('http://localhost:3001/in', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user data') 
      }
      
      const profileData = await userResponse.json()
      
      if (!profileData.success || !profileData.user) {
        throw new Error('No user data found')
      }
      
      const user = profileData.user
      console.log('Fetched user data for edit:', user) // Debug log
      
      setUserData(user)
      
      // Populate form with existing data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || '',
        city: user.city || '',
        interests: user.interests || '',
        // Lawyer specific fields - check if lawyer data exists
        lawFirm: user.lawyer?.lawFirm || '',
        licenseNumber: user.lawyer?.badgeNumber || '',
        summary: user.lawyer?.summary || '',
        legalAreas: user.lawyer?.legalAreas || ''
      })
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast("Error", {
        description: "Failed to load profile data. Please try again."
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
      
      const data = await response.json()
      
      if (data.success || response.ok) {
        toast("Profile Updated", {
          description: "Your profile has been updated successfully"
        })
        
        // Redirect back to profile
        router.push(`/in`)
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
      
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
          color: 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
        }
      case 'pending':
        return {
          label: 'Pending Verification',
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800'
        }
      case 'rejected':
        return {
          label: 'Verification Rejected',
          icon: XCircle,
          color: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
        }
      default:
        return {
          label: 'Training Lawyer',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse"></div>
                  </div>
                </div>
                <Separator />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load your profile data. Please try again.
            </p>
            <Button onClick={fetchUserData} className="w-full">
              <Loader2 className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update your personal information and professional details
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="shadow-sm">
                <Link href="/in">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  Back to Profile
                </Link>
              </Button>
            </div>
            
            {verificationBadge && (
              <Badge variant="secondary" className={`${verificationBadge.color} flex items-center w-fit px-4 py-2 text-sm font-medium`}>
                <verificationBadge.icon className="h-4 w-4 me-2" />
                {verificationBadge.label}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      required
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      required
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    className="h-12 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter your country"
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Professional Information - Only for Lawyers */}
              {userData?.role === 'lawyer' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mr-4">
                      <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Professional Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lawFirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Law Firm
                      </Label>
                      <Input
                        id="lawFirm"
                        value={formData.lawFirm}
                        onChange={(e) => handleInputChange('lawFirm', e.target.value)}
                        placeholder="Enter your law firm name"
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        License/Badge Number
                      </Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="Enter your license number"
                        className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Professional Summary
                    </Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Tell us about your legal expertise and experience..."
                      rows={4}
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalAreas" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Legal Areas of Expertise
                    </Label>
                    <Textarea
                      id="legalAreas"
                      value={formData.legalAreas}
                      onChange={(e) => handleInputChange('legalAreas', e.target.value)}
                      placeholder="e.g., Family Law, Corporate Law, Criminal Defense..."
                      rows={3}
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Separate multiple areas with commas
                    </p>
                  </div>
                </div>
              )}

              {userData?.role === 'lawyer' && <Separator className="my-8" />}

              {/* Interests */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mr-4">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Interests & Focus Areas</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple interests with commas
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" asChild className="sm:w-auto w-full h-12 border-gray-300 dark:border-gray-600">
                  <Link href="/in">
                    Cancel
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="sm:w-auto w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
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