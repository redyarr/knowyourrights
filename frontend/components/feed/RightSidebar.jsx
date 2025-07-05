"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { toast } from "sonner"
import { Newspaper, Users, Clock } from 'lucide-react'

const RightSidebar = () => {
  const [suggestedLawyers, setSuggestedLawyers] = useState([])
  const [loading, setLoading] = useState(true)

  const legalNews = [
    {
      title: 'New Employment Law Changes',
      time: '2 hours ago',
      readers: '1,234',
      href: '/news/employment-changes'
    },
    {
      title: 'Supreme Court Ruling Impact',
      time: '5 hours ago',
      readers: '2,567',
      href: '/news/supreme-court'
    },
    {
      title: 'Consumer Rights Update',
      time: '1 day ago',
      readers: '892',
      href: '/news/consumer-rights'
    }
  ]

  useEffect(() => {
    fetchSuggestedLawyers()
  }, [])

  const fetchSuggestedLawyers = async () => {
    try {
      const response = await fetch('http://localhost:3001/mynetwork/suggested-lawyers')
      const data = await response.json()
      
      if (data.success) {
        setSuggestedLawyers(data.lawyers || [])
      }
    } catch (error) {
      console.error('Error fetching suggested lawyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (userId, button) => {
    try {
      const response = await fetch(`http://localhost:3001/mynetwork/connect/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for session cookies
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast("Connection Request Sent", {
          description: "Your connection request has been sent successfully"
        })
        
        // Update UI
        button.textContent = 'Request Sent'
        button.disabled = true
        button.className = button.className.replace('border-blue-600 text-blue-600', 'border-gray-400 text-gray-400')
      } else {
        toast("Request Failed", {
          description: data.message || 'Failed to send connection request'
        })
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Network Error", {
        description: 'Failed to send connection request. Please try again.'
      })
    }
  }

  const getUserInitials = (lawyer) => {
    return `${lawyer.firstName?.[0] || ''}${lawyer.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <aside className="hidden lg:block space-y-4">
      {/* Legal News */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5" />
            <h3 className="font-semibold">Legal News</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {legalNews.map((news, index) => (
              <Link
                key={index}
                href={news.href}
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-medium text-sm mb-1 line-clamp-2">
                  {news.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{news.time}</span>
                  <span>•</span>
                  <span>{news.readers} readers</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* People you may know */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">People you may know</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : suggestedLawyers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No suggestions available
            </p>
          ) : (
            <div className="space-y-3">
              {suggestedLawyers.slice(0, 5).map((lawyer) => (
                <div key={lawyer.id} className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={lawyer.ProfileImage?.imagePath || lawyer.profilePicture} 
                      alt={`${lawyer.firstName}'s Profile`}
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials(lawyer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {lawyer.firstName} {lawyer.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {lawyer.Lawyer?.lawFirm || 'Legal Professional'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => sendConnectionRequest(lawyer.id, e.target)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

export default RightSidebar
