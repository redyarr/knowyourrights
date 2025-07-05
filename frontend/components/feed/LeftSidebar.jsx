"use client"

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Users, Crown, Hash, Eye, TrendingUp } from 'lucide-react'

const LeftSidebar = ({ userData }) => {
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
    <aside className="hidden lg:block space-y-4">
      {/* Profile Card */}
      {userData && (
        <Card className="overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <CardContent className="pt-0 pb-4">
            <div className="flex flex-col items-center -mt-8">
              <Avatar className="h-16 w-16 border-4 border-background">
                <AvatarImage src={userData.profilePicture} alt="Profile" />
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-2 font-semibold text-lg text-center">
                {getUserDisplayName()}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {userData.headline || getUserRole()}
              </p>
              <Link 
                href={`/in/${userData.id}`}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View profile
              </Link>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Profile viewers</span>
                </div>
                <span className="text-sm font-medium text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Post impressions</span>
                </div>
                <span className="text-sm font-medium text-blue-600">1,204</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Link 
              href="/premium" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Try Premium for free</span>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Recent</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { name: 'Family Law Group', href: '/groups/family-law' },
              { name: 'Employment Rights', href: '/groups/employment' },
              { name: 'Consumer Protection', href: '/groups/consumer' }
            ].map((group, index) => (
              <Link
                key={index}
                href={group.href}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{group.name}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Groups */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Groups</h3>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2">
            {[
              { name: 'Legal Professionals', href: '/groups/legal' },
              { name: 'Know Your Rights', href: '/groups/rights' }
            ].map((group, index) => (
              <Link
                key={index}
                href={group.href}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{group.name}</span>
              </Link>
            ))}
            <Link href="/groups" className="text-sm text-muted-foreground hover:text-blue-600">
              Show all (5)
            </Link>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2 text-sm">Followed Hashtags</h4>
            <div className="space-y-2">
              {[
                { tag: 'legaladvice', href: '/hashtag/legaladvice' },
                { tag: 'knowyourrights', href: '/hashtag/knowyourrights' }
              ].map((hashtag, index) => (
                <Link
                  key={index}
                  href={hashtag.href}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{hashtag.tag}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <Link href="/discover" className="text-sm text-muted-foreground hover:text-blue-600">
            Discover more
          </Link>
        </CardContent>
      </Card>
    </aside>
  )
}

export default LeftSidebar
