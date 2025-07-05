"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef(null)

  const getUserData = async () => {
    try {
      const response = await fetch('/api/getuserdata', {
        method: 'GET',
      });

      const data = await response.json();
      
      if (data.success) {
        setUserData(data.payload);
      } else {
        setMessage(data.error || 'Error getting user data');
      }
    } catch (error) {
      console.error('Get user data error:', error);
      setMessage('Network error during data fetch');
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/signout', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setUserData(null);
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        setMessage(data.error || 'Signout failed');
      }
    } catch (error) {
      console.error('Signout error:', error);
      setMessage('Network error during signout');
    } finally {
      setLoading(false);
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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => pathname === path || pathname.startsWith(path)

  const navigationItems = [
    { href: '/', icon: Home, label: 'Home', paths: ['/', '/blog'] },
    { href: '/mynetwork', icon: Users, label: 'My Network', paths: ['/mynetwork'] },
    { href: '/jobs', icon: Briefcase, label: 'Jobs', paths: ['/jobs'] },
    { 
      href: '/messaging', 
      icon: MessageCircle, 
      label: 'Messaging', 
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

  // Hide navbar on messaging page for mobile
  if (pathname.includes('/messaging')) {
    return null
  }

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Profile Picture / Logo */}
          {userData ? (
            <Link href={`/in/${userData._id}`} className="flex items-center p-1">
              <Avatar className="h-9 w-9">
                <AvatarImage 
                  src={userData.profilePicture} 
                  alt="Profile" 
                />
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Search Bar */}
          <div className="flex-1 mx-3" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
              
              {/* Mobile Search Results */}
              {showSearchResults && (
                <div className="absolute mt-2 w-full bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Quick Actions
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${suggestion.color}`}>
                            <suggestion.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{suggestion.title}</div>
                            <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {userData && (
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
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
                      <Link href="/in">View Profile</Link>
                    </Button>
                  </div>
                )}
                
                <nav className="space-y-1 flex-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href) 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
                
                {userData && (
                  <div className="border-t pt-4 space-y-1">
                    <Link href="/in/edit" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                      <User className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                      <Settings className="h-5 w-5" />
                      <span>Settings & Privacy</span>
                    </Link>
                    <Link href="/help" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                      <HelpCircle className="h-5 w-5" />
                      <span>Help Center</span>
                    </Link>
                    <Link href="/about" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                      <Info className="h-5 w-5" />
                      <span>About Us</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={handleSignOut}
                      disabled={loading}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {loading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-16 items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-blue-700 font-bold text-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                    <Scale className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-foreground tracking-tight">LegalNet</span>
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
                    className="w-80 pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                  />
                  
                  {/* Desktop Search Results */}
                  {showSearchResults && (
                    <div className="absolute mt-2 w-full bg-popover border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-6">
                        <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                          Quick Actions
                        </div>
                        <div className="space-y-1">
                          {searchSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${suggestion.color}`}>
                                <suggestion.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{suggestion.title}</div>
                                <div className="text-sm text-muted-foreground">{suggestion.description}</div>
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
              <div className="flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center transition-colors px-3 py-2 relative ${
                      isActive(item.href)
                        ? 'text-foreground border-b-2 border-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px]">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {userData &&
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={userData.profilePicture} alt="Profile" />
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Me</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3 mb-3">
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
                        <Link href="/in">View Profile</Link>
                      </Button>
                    </div>
                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link href="/in/edit" className="flex items-center">
                          <User className="mr-3 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-3 h-4 w-4" />
                          Settings & Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/help" className="flex items-center">
                          <HelpCircle className="mr-3 h-4 w-4" />
                          Help Center
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/about" className="flex items-center">
                          <Info className="mr-3 h-4 w-4" />
                          About Us
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={handleSignOut}
                        disabled={loading}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        {loading ? 'Signing out...' : 'Sign Out'}
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                }
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {userData && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
          <div className={`flex items-center justify-around h-16 ${
            userData.userType === 'lawyer' ? 'px-2' : 'px-4'
          }`}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-2 transition-colors min-w-0 flex-1 relative ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-normal">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="absolute top-1 right-2 h-4 w-4 p-0 text-[9px]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </Link>
            ))}
            
            {/* Post Button for Lawyers */}
            {userData.userType === 'lawyer' && (
              <Link
                href="/profile/createPost"
                className="flex flex-col items-center justify-center py-2 px-2 text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1"
              >
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mb-1">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-normal">Post</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {message && (
        <div className="fixed top-20 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      )}
    </>
  )
}

export default Navbar