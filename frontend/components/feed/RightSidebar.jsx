"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { toast } from "sonner"
import { Newspaper, Users, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const RightSidebar = () => {
  const [allLawyers, setAllLawyers] = useState([])
  const [visibleLawyers, setVisibleLawyers] = useState([])
  const [hiddenLawyers, setHiddenLawyers] = useState([])
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
      const response = await fetch('http://localhost:3001/mynetwork/suggested-lawyers', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success && data.lawyers) {
        const lawyers = data.lawyers
        setAllLawyers(lawyers)
        
        // Show first 3, keep rest for cycling
        setVisibleLawyers(lawyers.slice(0, 3))
        setHiddenLawyers(lawyers.slice(3))
      }
    } catch (error) {
      console.error('Error fetching suggested lawyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const cycleToNextLawyer = (removedLawyerId) => {
    // If we have hidden lawyers, show the next one
    if (hiddenLawyers.length > 0) {
      const nextLawyer = hiddenLawyers[0]
      
      setVisibleLawyers(prev => 
        prev.map(lawyer => 
          lawyer.id === removedLawyerId ? nextLawyer : lawyer
        )
      )
      
      // Move the removed lawyer to the end of hidden lawyers and remove the shown one
      const removedLawyer = visibleLawyers.find(l => l.id === removedLawyerId)
      if (removedLawyer) {
        setHiddenLawyers(prev => [...prev.slice(1), removedLawyer])
      }
    } else {
      // If no hidden lawyers, just cycle from all lawyers
      const remainingLawyers = allLawyers.filter(lawyer => 
        !visibleLawyers.some(vl => vl.id === lawyer.id) || lawyer.id === removedLawyerId
      )
      
      if (remainingLawyers.length > 0) {
        const nextLawyer = remainingLawyers[0]
        setVisibleLawyers(prev =>
          prev.map(lawyer =>
            lawyer.id === removedLawyerId ? nextLawyer : lawyer
          )
        )
      }
    }
  }

  const sendConnectionRequest = async (userId, button) => {
    try {
      const response = await fetch(`http://localhost:3001/mynetwork/connect/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast("Connection Request Sent", {
          description: "Your connection request has been sent successfully"
        })
        
        // Update the lawyer's status in ALL arrays (visible, hidden, and all)
        const updateLawyerStatus = (lawyer) => {
          if (lawyer.id === userId) {
            return {
              ...lawyer,
              connectionStatus: 'pending',
              connectionType: 'sent',
              connectionId: data.connectionId
            }
          }
          return lawyer
        }
        
        // Update visible lawyers
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update hidden lawyers
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update all lawyers
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        // Start the cycling animation after a short delay
        setTimeout(() => {
          cycleToNextLawyer(userId)
        }, 600) // Wait for exit animation to complete
        
      } else {
        toast("Request Failed", {
          description: data.message || 'Failed to send connection request'
        })
        button.textContent = 'Connect'
        button.disabled = false
      }
    } catch (error) {
      console.error('Connection request error:', error)
      toast("Network Error", {
        description: 'Failed to send connection request. Please try again.'
      })
      button.textContent = 'Connect'
      button.disabled = false
    }
  }

  const cancelConnectionRequest = async (connectionId, button) => {
    try {
      const response = await fetch(`http://localhost:3001/mynetwork/cancel/${connectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast("Request Cancelled", {
          description: "Your connection request has been cancelled"
        })
        
        const userId = parseInt(button.getAttribute('data-user-id'))
        
        // Update the lawyer's status in ALL arrays (visible, hidden, and all)
        const updateLawyerStatus = (lawyer) => {
          if (lawyer.id === userId) {
            return {
              ...lawyer,
              connectionStatus: null,
              connectionType: null,
              connectionId: null
            }
          }
          return lawyer
        }
        
        // Update visible lawyers
        setVisibleLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update hidden lawyers  
        setHiddenLawyers(prev => prev.map(updateLawyerStatus))
        
        // Update all lawyers
        setAllLawyers(prev => prev.map(updateLawyerStatus))
        
        button.textContent = 'Connect'
        button.className = button.className.replace('border-red-600 text-red-600', 'border-blue-600 text-blue-600')
        button.setAttribute('data-action', 'connect')
        button.removeAttribute('data-connection-id')
        button.disabled = false
      } else {
        toast("Cancel Failed", {
          description: data.message || 'Failed to cancel connection request'
        })
        button.textContent = 'Cancel'
        button.disabled = false
      }
    } catch (error) {
      console.error('Cancel request error:', error)
      toast("Network Error", {
        description: 'Failed to cancel request. Please try again.'
      })
      button.textContent = 'Cancel'
      button.disabled = false
    }
  }

  const handleButtonClick = (button) => {
    const action = button.getAttribute('data-action')
    const userId = button.getAttribute('data-user-id')
    const connectionId = button.getAttribute('data-connection-id')
    
    // Disable button and show loading state
    button.disabled = true
    const originalText = button.textContent
    button.textContent = action === 'connect' ? 'Sending...' : 'Cancelling...'
    
    // Helper function to reset button state
    const resetButton = () => {
      button.textContent = originalText
      button.disabled = false
    }
    
    if (action === 'connect') {
      sendConnectionRequest(parseInt(userId), button).catch(() => {
        resetButton()
      })
    } else if (action === 'cancel') {
      cancelConnectionRequest(connectionId, button).catch(() => {
        resetButton()
      })
    }
  }

  const getUserInitials = (lawyer) => {
    return `${lawyer.firstName?.[0] || ''}${lawyer.lastName?.[0] || ''}`.toUpperCase()
  }

  const refreshSuggestions = () => {
    // Shuffle all lawyers and show 3 new ones
    const shuffledLawyers = [...allLawyers].sort(() => Math.random() - 0.5)
    setVisibleLawyers(shuffledLawyers.slice(0, 3))
    setHiddenLawyers(shuffledLawyers.slice(3))
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">People you may know</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              className="h-8 w-8 p-0 hover:bg-muted/50"
              title="Refresh suggestions"
              disabled={loading || allLawyers.length === 0}
            >
              <svg
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
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
          ) : visibleLawyers.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">No suggestions available</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSuggestedLawyers}
                className="mt-2 text-xs"
              >
                Try refreshing
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {visibleLawyers.map((lawyer) => {
                    // Determine button state based on connection status
                    const getButtonConfig = () => {
                      if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'sent') {
                        return {
                          text: 'Cancel',
                          className: 'border-red-600 text-red-600',
                          action: 'cancel',
                          connectionId: lawyer.connectionId
                        }
                      } else if (lawyer.connectionStatus === 'pending' && lawyer.connectionType === 'received') {
                        return {
                          text: 'Respond',
                          className: 'border-green-600 text-green-600',
                          action: 'respond',
                          connectionId: lawyer.connectionId
                        }
                      } else {
                        return {
                          text: 'Connect',
                          className: 'border-blue-600 text-blue-600',
                          action: 'connect',
                          connectionId: null
                        }
                      }
                    }

                    const buttonConfig = getButtonConfig()

                    return (
                      <motion.div
                        key={lawyer.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          y: -50, 
                          scale: 0.8,
                          transition: { duration: 0.4, ease: "easeInOut" }
                        }}
                        transition={{ 
                          duration: 0.5, 
                          ease: "easeOut",
                          layout: { duration: 0.3 }
                        }}
                        className="flex items-center space-x-3"
                      >
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
                          className={`text-xs transition-all duration-200 ${buttonConfig.className}`}
                          data-user-id={lawyer.id}
                          data-action={buttonConfig.action}
                          data-connection-id={buttonConfig.connectionId}
                          onClick={(e) => handleButtonClick(e.target)}
                        >
                          {buttonConfig.text}
                        </Button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
              
             
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

export default RightSidebar
