"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ThemeToggle from "@/components/ThemeToggle"
import {
  Settings,
  Shield,
  Bell,
  User,
  Eye,
  Lock,
  Moon,
  Sun,
  Laptop,
  Edit2,
  Save,
  Camera,
  MapPin,
  Phone,
  BookOpen,
} from "lucide-react"

export default function SettingsPage() {
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+1 (555) 019-2834",
    location: "New York, NY",
    bio: "Advocate dedicated to civil rights and digital freedoms litigation.",
  })
  
  // Avatar upload simulation states
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarProgress, setAvatarProgress] = useState(0)

  const [passwordState, setPasswordState] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [settingsState, setSettingsState] = useState({
    emailNotifications: true,
    connectionRequests: true,
    profileVisibility: "public",
    anonymousPosting: false,
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/getuserdata")
      const data = await response.json()
      if (data.success) {
        setUserData(data.payload)
        setProfileForm((prev) => ({
          ...prev,
          firstName: data.payload.firstName || "",
          lastName: data.payload.lastName || "",
        }))
        setAvatarUrl(data.payload.profileImage || "")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    setIsEditing(false)
    toast.success("Profile details updated locally!")
    setUserData((prev) => ({
      ...prev,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setAvatarProgress(10)
    
    // Simulate upload progress
    const timer = setInterval(() => {
      setAvatarProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setAvatarUrl(URL.createObjectURL(file))
          setUploadingAvatar(false)
          toast.success("Profile picture updated successfully!")
          return 0;
        }
        return prev + 30;
      })
    }, 300)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setSubmittingPassword(true)
    setTimeout(() => {
      toast.success("Security credentials updated successfully!")
      setPasswordState({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setSubmittingPassword(false)
    }, 1200)
  }

  const handleToggleChange = (key) => {
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      toast.success("Preference updated")
      return updated
    })
  }

  const handleSelectVisibility = (value) => {
    setSettingsState((prev) => ({ ...prev, profileVisibility: value }))
    toast.success(`Profile visibility set to ${value}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6 sm:mb-8">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} /> Settings & Privacy
        </h1>

        {/* Mobile horizontal tab bar */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-hide">
          {[
            { key: "profile", icon: User, label: "Account" },
            { key: "security", icon: Lock, label: "Security" },
            { key: "notifications", icon: Bell, label: "Alerts" },
            { key: "visibility", icon: Eye, label: "Privacy" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              className="shrink-0 h-9 text-xs font-bold rounded-full px-4"
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Desktop Side Tabs Navigation */}
          <div className="hidden md:block space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start font-semibold text-sm ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="mr-2 h-4 w-4" /> Account Details
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start font-semibold text-sm ${
                activeTab === "security"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <Lock className="mr-2 h-4 w-4" /> Security & Login
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start font-semibold text-sm ${
                activeTab === "notifications"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start font-semibold text-sm ${
                activeTab === "visibility"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setActiveTab("visibility")}
            >
              <Eye className="mr-2 h-4 w-4" /> Visibility
            </Button>
          </div>

          {/* Main Setting Cards */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">Account Profile Info</CardTitle>
                      <CardDescription>Verify and modify your public credentials.</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button size="sm" variant="outline" className="font-semibold" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Section */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-blue-500">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
                          {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition">
                        <Camera className="h-3 w-3" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Profile Picture</h4>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or GIF. Max 5MB.</p>
                      {uploadingAvatar && (
                        <div className="w-48 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${avatarProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="editFirst">First Name</Label>
                          <Input
                            id="editFirst"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="editLast">Last Name</Label>
                          <Input
                            id="editLast"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="editPhone">Phone Number</Label>
                          <Input
                            id="editPhone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="editLoc">Location</Label>
                          <Input
                            id="editLoc"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="editBio">Biography</Label>
                        <Textarea
                          id="editBio"
                          rows={3}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                          <Save className="h-4 w-4 mr-1" /> Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-400 text-xs">First Name</Label>
                          <p className="font-semibold text-sm mt-0.5">{userData?.firstName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-slate-400 text-xs">Last Name</Label>
                          <p className="font-semibold text-sm mt-0.5">{userData?.lastName || "N/A"}</p>
                        </div>
                      </div>
                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <Label className="text-slate-400 text-[10px] block">Phone Number</Label>
                            <span className="text-xs font-semibold">{profileForm.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <Label className="text-slate-400 text-[10px] block">Location</Label>
                            <span className="text-xs font-semibold">{profileForm.location}</span>
                          </div>
                        </div>
                      </div>
                      <Separator />

                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <Label className="text-slate-400 text-[10px] block">Biography</Label>
                          <span className="text-xs font-medium leading-relaxed block mt-0.5">{profileForm.bio}</span>
                        </div>
                      </div>
                      <Separator />

                      <div>
                        <Label className="text-slate-400 text-xs">Email Address</Label>
                        <p className="font-semibold text-sm mt-0.5">{userData?.email || "N/A"}</p>
                      </div>
                      <Separator />

                      <div>
                        <Label className="text-slate-400 text-xs">Access Level / Role</Label>
                        <p className="font-semibold text-sm mt-0.5 capitalize text-blue-600 dark:text-blue-400">{userData?.userType || "Member"}</p>
                      </div>
                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-700 dark:text-slate-300 font-bold block">Theme Mode</Label>
                          <span className="text-xs text-muted-foreground">Change the visual appearance of the application.</span>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Update Password</CardTitle>
                  <CardDescription>Ensure your account stays secure by updating your credentials.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="oldPass">Current Password</Label>
                      <Input
                        id="oldPass"
                        type="password"
                        required
                        value={passwordState.oldPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, oldPassword: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="newPass">New Password</Label>
                      <Input
                        id="newPass"
                        type="password"
                        required
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirmPass">Confirm New Password</Label>
                      <Input
                        id="confirmPass"
                        type="password"
                        required
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={submittingPassword}>
                      {submittingPassword ? "Updating..." : "Save Security Details"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
                  <CardDescription>Manage how you want to be alerted of new updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-800 dark:text-slate-200 font-bold block">Email Alerts</Label>
                      <span className="text-xs text-muted-foreground">Receive daily digests of your messages and network queries.</span>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600"
                      checked={settingsState.emailNotifications}
                      onChange={() => handleToggleChange("emailNotifications")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-800 dark:text-slate-200 font-bold block">Connection Request Alerts</Label>
                      <span className="text-xs text-muted-foreground">Get notified when someone requests to join your network.</span>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600"
                      checked={settingsState.connectionRequests}
                      onChange={() => handleToggleChange("connectionRequests")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "visibility" && (
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Privacy & Visibility</CardTitle>
                  <CardDescription>Control who can view your profile details and listings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-slate-800 dark:text-slate-200 font-bold block">Profile Visibility</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["public", "network", "private"].map((mode) => (
                        <Button
                          key={mode}
                          variant={settingsState.profileVisibility === mode ? "default" : "outline"}
                          className="capitalize h-9 font-semibold"
                          onClick={() => handleSelectVisibility(mode)}
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-800 dark:text-slate-200 font-bold block">Anonymous Posting</Label>
                      <span className="text-xs text-muted-foreground">Hide your name when posting new questions or feedback.</span>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600"
                      checked={settingsState.anonymousPosting}
                      onChange={() => handleToggleChange("anonymousPosting")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
