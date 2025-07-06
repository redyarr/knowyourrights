"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Search, 
  Plus, 
  Menu, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle, 
  Info,
  Scale,
  Bell
} from 'lucide-react'

const Navbar = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false)
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)

  const getUserData = async () => {
    try {
      const response = await fetch('/api/getuserdata', {
        method: 'GET',
      });

      const data = await response.json();
      
      if (data.success) {
        setUserData(data.payload);
      } else {
        toast("Error", {
          description: "Error getting user data",
          action: {
            label: "Undo",
          },
        })
      }
    } catch (error) {
     toast("Ntwork Error", {
          description: "etwork error during data fetch",
          action: {
            label: "Undo",
          },
        })
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/signout', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setUserData(null);
          router.push('/signin');
      } else {
        setMessage(data.error || 'Signout failed');
      }
    } catch (error) {
      console.error('Signout error:', error);
      setMessage('Network error during signout');
    } 
  };

  useEffect(() => {
    getUserData();
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => pathname === path || pathname.startsWith(path)

  const navigationItems = [
    { href: '/', icon: Home, label: 'Home', paths: ['/', '/blog'] },
    { href: '/mynetwork', icon: Users, label: 'Network', paths: ['/mynetwork'] },
    { href: '/jobs', icon: Briefcase, label: 'Jobs', paths: ['/jobs'] },
    { 
      href: '/messaging', 
      icon: MessageCircle, 
      label: 'Messages', 
      paths: ['/messaging'],
      badge: unreadMessageCount > 0 ? unreadMessageCount : null
    },
  ]

  const searchSuggestions = [
    {
      icon: User,
      title: 'Find lawyers by specialty',
      description: 'Browse verified legal professionals',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      icon: Users,
      title: 'Connect with professionals',
      description: 'Expand your legal network',
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
    },
    {
      icon: Scale,
      title: 'Browse legal resources',
      description: 'Access legal documents and guides',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
    }
  ]

  const getUserInitials = () => {
    if (!userData) return 'U'
    return `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!userData) return 'Guest User'
    return `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
  }

  const getUserRole = () => {
    if (!userData) return 'Member'
    return userData.userType === 'admin' ? 'Administrator' : 
           userData.userType === 'lawyer' ? 'Lawyer' : 'Member'
  }

  return (
    <>
      {/* Mobile Top Header - LinkedIn Style */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Profile Picture - Opens Sidebar */}
          {userData ? (
            <Sheet open={profileSidebarOpen} onOpenChange={setProfileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userData.profilePicture} alt="Profile" />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Profile Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={userData.profilePicture} alt="Profile" />
                        <AvatarFallback className="bg-blue-600 text-white text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-foreground">{getUserDisplayName()}</h4>
                        <p className="text-sm text-muted-foreground">{getUserRole()}</p>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/in" onClick={() => setProfileSidebarOpen(false)}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="flex-1 p-4">
                    <div className="space-y-1">
                      <Link 
                        href="/in/edit" 
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <User className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Edit Profile</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Settings & Privacy</span>
                      </Link>
                      <Link 
                        href="/help" 
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <HelpCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Help Center</span>
                      </Link>
                      <Link 
                        href="/about" 
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <Info className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">About Us</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Sign Out Button */}
                  <div className="p-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full bg-destructive text-white justify-start hover:bg-destructive/80" 
                      onClick={() => {
                        setProfileSidebarOpen(false)
                        handleSignOut()
                      }}
                      disabled={loading}
                    >
                      <LogOut className=" text-white h-5 w-5 mr-3" />
                      {loading ? <p className='text-white'>Signing out...</p> : <p className='text-white'>Sign Out</p>}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Search Bar - Shows Dropdown like Desktop */}
          <div className="flex-1 mx-3" ref={mobileSearchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowMobileSearchResults(true)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
              
              {/* Mobile Search Results - Same as Desktop */}
              {showMobileSearchResults && (
                <div className="absolute mt-2 w-full bg-popover border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Quick Actions
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="flex items-center space-x-3 p-2.5 hover:bg-accent rounded-lg  transition-colors"
                          onClick={() => setShowMobileSearchResults(false)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suggestion.color}`}>
                            <suggestion.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">{suggestion.title}</div>
                            <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages Button */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 relative">
            <Link href="/messaging">
              <MessageCircle className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-foreground tracking-tight text-lg">LegalNet</span>
                </div>
              </Link>
              
              {/* Search Bar */}
              <div className="relative ml-4" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    className="w-72 pl-10 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
                  />
                  
                  {/* Desktop Search Results */}
                  {showSearchResults && (
                    <div className="absolute mt-2 w-full bg-popover border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                          Quick Actions
                        </div>
                        <div className="space-y-1">
                          {searchSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2.5 hover:bg-accent rounded-lg transition-colors">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suggestion.color}`}>
                                <suggestion.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground text-sm">{suggestion.title}</div>
                                <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Navigation */}
            {userData && (
              <div className="flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center transition-colors px-2 py-1.5 relative ${
                      isActive(item.href)
                        ? 'text-foreground border-b-2 border-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-xs font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 p-0 text-[9px] flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {userData ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={userData.profilePicture} alt="Profile" />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Me</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-3 border-b">
                      <div className="flex items-center space-x-3 mb-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userData.profilePicture} alt="Profile" />
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{getUserDisplayName()}</h4>
                          <p className="text-xs text-muted-foreground">{getUserRole()}</p>
                        </div>
                      </div>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/in">View Profile</Link>
                      </Button>
                    </div>
                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link href="/in/edit" className="flex items-center text-sm">
                          <User className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center text-sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings & Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/help" className="flex items-center text-sm">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Help Center
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/about" className="flex items-center text-sm">
                          <Info className="mr-2 h-4 w-4" />
                          About Us
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="group text-white bg-destructive hover:bg-destructive/80  cursor-pointer text-sm transition duration-100"
                        onClick={handleSignOut}
                        disabled={loading}
                      >
                        <LogOut className="mr-2 h-4 w-4 text-white group-hover:text-black" />
                        {loading ? 'Signing out...' : 'Sign Out'}
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/signin">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Join now</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {userData && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
          <div className="flex items-center justify-around h-14 px-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-colors min-w-0 flex-1 relative ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 mb-1" strokeWidth={2} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="absolute top-0 right-1 h-3 w-3 p-0 text-[8px] flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </Link>
            ))}
            
            {/* Post Button for Lawyers */}
            {userData.userType === 'lawyer' && (
              <Link
                href="/profile/createPost"
                className="flex flex-col items-center justify-center py-1.5 px-2 text-muted-foreground transition-colors min-w-0 flex-1"
              >
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center mb-1">
                  <Plus className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-medium leading-none">Post</span>
              </Link>
            )}
          </div>
        </div>
      )}

    </>
  )
}

export default Navbar