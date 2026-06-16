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
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const [userData, setUserData] = useState(null)    
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false)
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  
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
      }
    } catch (error) {
      console.error(error)
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/notifications?format=json', {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setUnreadNotifCount(data.unreadCount || 0)
      }
    } catch (error) {
      // Silently fail — non-critical
    }
  }

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
        toast.error(data.error || 'Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Network error during signout');
    } 
  };

  useEffect(() => {
    getUserData();
  }, [])

  // Poll for notification count every 30s
  useEffect(() => {
    if (userData) {
      fetchUnreadNotifications()
      const interval = setInterval(fetchUnreadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userData])

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

  const isActive = (path) => pathname === path 

  const navigationItems = [
    { href: '/', icon: Home, label: 'Feed', paths: ['/', '/blog'] },
    { href: '/mynetwork', icon: Users, label: 'Network', paths: ['/mynetwork'] },
    { href: '/jobs', icon: Briefcase, label: 'Jobs', paths: ['/jobs'] },
    { href: '/messaging', icon: MessageCircle, label: 'Messages', paths: ['/messaging'], badge: unreadMessageCount > 0 ? unreadMessageCount : null},
    { href: '/notifications', icon: Bell, label: 'Alerts', paths: ['/notifications'], badge: unreadNotifCount > 0 ? unreadNotifCount : null },
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
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'
    },
    {
      icon: Scale,
      title: 'Browse legal resources',
      description: 'Access legal documents and guides',
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
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
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          {userData ? (
            <Sheet open={profileSidebarOpen} onOpenChange={setProfileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-full overflow-hidden">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userData?.profileImage} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-col h-full">
                  {/* Profile Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-blue-500">
                        <AvatarImage src={userData?.profileImage} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-base font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{getUserDisplayName()}</h4>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize bg-blue-50 dark:bg-blue-950/35 px-2 py-0.5 rounded-full border border-blue-100/50 dark:border-blue-900/30 mt-1 inline-block">
                          {getUserRole()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 mt-6">
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex-1">
                        <Link href="/in" onClick={() => setProfileSidebarOpen(false)}>
                          View Profile
                        </Link>
                      </Button>
                      <ThemeToggle />
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1.5">
                      <Link 
                        href="/notifications" 
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <span className="flex items-center space-x-3">
                          <Bell className="h-4 w-4 text-amber-500" />
                          <span>Notifications</span>
                        </span>
                        {unreadNotifCount > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
                            {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                          </Badge>
                        )}
                      </Link>
                      <Link 
                        href="/in/edit" 
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Edit Profile</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Settings & Privacy</span>
                      </Link>
                      <Link 
                        href="/help" 
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 text-emerald-600" />
                        <span>Help Center</span>
                      </Link>
                      <Link 
                        href="/aboutus" 
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors"
                        onClick={() => setProfileSidebarOpen(false)}
                      >
                        <Info className="h-4 w-4 text-purple-600" />
                        <span>About Us</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
                    <Button 
                      variant="ghost" 
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold hover:text-white"
                      onClick={() => {
                        setProfileSidebarOpen(false)
                        handleSignOut()
                      }}
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Scale className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Mobile Search */}
          <div className="flex-1 mx-3" ref={mobileSearchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowMobileSearchResults(true)}
                className="pl-9 h-9 bg-slate-100 dark:bg-slate-900 border-0 focus-visible:ring-1 text-xs"
              />
              
              {showMobileSearchResults && (
                <div className="absolute mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3">
                    <div className="text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                      Quick Suggestions
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2.5 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
                          onClick={() => setShowMobileSearchResults(false)}
                        >
                          <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${suggestion.color}`}>
                            <suggestion.icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{suggestion.title}</div>
                            <div className="text-[10px] text-slate-400">{suggestion.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile notification bell */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 relative hover:bg-slate-50 dark:hover:bg-slate-800">
            <Link href="/notifications">
              <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {unreadNotifCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center rounded-full font-bold">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="h-9 w-9 relative hover:bg-slate-50 dark:hover:bg-slate-800 ml-1">
            <Link href="/messaging">
              <MessageCircle className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              {unreadMessageCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center rounded-full font-bold">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop Header Navigation */}
      <nav className="hidden lg:block bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex justify-between h-16 items-center">
            {/* Left Section Logo & Search */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
                    <Scale className="h-4.5 w-4.5 text-white" />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-lg">LegalNet</span>
                </div>
              </Link>
              
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search people, resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    className="w-72 pl-9 h-9.5 bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 focus-visible:ring-1 text-xs"
                  />
                  
                  {showSearchResults && (
                    <div className="absolute mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-3">
                        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                          Suggested Actions
                        </div>
                        <div className="space-y-1">
                          {searchSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${suggestion.color}`}>
                                <suggestion.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{suggestion.title}</div>
                                <div className="text-[10px] text-slate-400">{suggestion.description}</div>
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

            {/* Navigation links */}
            {userData && (
              <div className="flex items-center space-x-6">
                {navigationItems.map((item) => {
                  const LinkIcon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex flex-col items-center transition-all py-1.5 relative group ${
                        active
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
                      }`}
                    >
                      <LinkIcon className="h-5 w-5 mb-0.5" />
                      <span className="text-[10px]">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="absolute -top-0.5 -right-1.5 h-3.5 w-3.5 p-0 text-[8px] flex items-center justify-center rounded-full font-bold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Right section: theme & user profile menu */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {userData && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-1 border border-slate-200/50 dark:border-slate-800/50 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={userData?.profileImage} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold pr-2 text-slate-700 dark:text-slate-300">Me</span>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                    <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center space-x-2.5 mb-3">
                        <Avatar className="h-10 w-10 border border-slate-200/50 dark:border-slate-800">
                          <AvatarImage src={userData?.profileImage} alt="Profile" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[130px]">{getUserDisplayName()}</h4>
                          <span className="text-[10px] text-slate-400 capitalize">{getUserRole()}</span>
                        </div>
                      </div>
                      <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                        <Link href="/in">View Profile</Link>
                      </Button>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/in/edit" className="flex items-center text-xs font-semibold py-2">
                          <User className="mr-2 h-4 w-4 text-slate-400" />
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/settings" className="flex items-center text-xs font-semibold py-2">
                          <Settings className="mr-2 h-4 w-4 text-slate-400" />
                          Settings & Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/help" className="flex items-center text-xs font-semibold py-2">
                          <HelpCircle className="mr-2 h-4 w-4 text-slate-400" />
                          Help Center
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/aboutus" className="flex items-center text-xs font-semibold py-2">
                          <Info className="mr-2 h-4 w-4 text-slate-400" />
                          About Us
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-850" />
                      <DropdownMenuItem 
                        className="rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:bg-rose-700 cursor-pointer text-xs font-bold py-2 mt-1 transition"
                        onClick={handleSignOut}
                        disabled={loading}
                      >
                        <LogOut className="mr-2 h-4 w-4 text-white" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) }
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {userData && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 safe-area-bottom">
          <div className="flex items-center justify-around h-14 px-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 transition-colors min-w-0 flex-1 relative ${
                    active
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" strokeWidth={2} />
                  <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="absolute top-0 right-2 h-3.5 w-3.5 p-0 text-[8px] flex items-center justify-center rounded-full font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar