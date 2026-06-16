"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Search,
  Send,
  User,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Scale,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
} from "lucide-react"

export default function MessagingPage() {
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [conversationPartner, setConversationPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Search & inputs
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [newMessageText, setNewMessageText] = useState("")

  // Micro-interactions
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [isAttachOpen, setIsAttachOpen] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const chatEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const lastPollTimeRef = useRef(Date.now())

  // Load conversions on load
  useEffect(() => {
    fetchConversations(true)
    return () => stopPolling()
  }, [])

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isPartnerTyping])

  // Start polling when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchConversationDetails(activeConversationId)
      startPolling(activeConversationId)
      simulatePartnerTyping()
    } else {
      stopPolling()
    }
  }, [activeConversationId])

  const simulatePartnerTyping = () => {
    setIsPartnerTyping(true)
    setTimeout(() => {
      setIsPartnerTyping(false)
    }, 2000)
  }

  const fetchConversations = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/messaging", {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setConversations(data.messages || [])
        setUserId(data.userId)
      } else {
        toast.error("Failed to load conversations")
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchConversationDetails = async (id) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/messaging/${id}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages || [])
        setConversationPartner(data.conversationPartner)
        lastPollTimeRef.current = Date.now()
      } else {
        toast.error("Failed to load conversation details")
      }
    } catch (error) {
      console.error("Error loading chat messages:", error)
      toast.error("Error loading chat history")
    } finally {
      setMessagesLoading(false)
    }
  }

  // Handle Search Query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsers(searchQuery)
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const searchUsers = async (query) => {
    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:3001/messaging/search?q=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartChat = (user) => {
    setConversationPartner(user)
    setActiveConversationId(user.id)
    setSearchQuery("")
    setSearchResults([])
  }

  // Polling mechanism
  const startPolling = (conversationId) => {
    stopPolling()
    lastPollTimeRef.current = Date.now()
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/messaging/${conversationId}/check-new?since=${lastPollTimeRef.current}`,
          { credentials: "include" }
        )
        const data = await response.json()
        if (data.success && data.newMessages && data.newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const filteredNew = data.newMessages.filter((m) => !existingIds.has(m.id))
            return [...prev, ...filteredNew]
          })
          lastPollTimeRef.current = Date.now()
          fetchConversations(false)
        }
      } catch (error) {
        console.error("Error polling for messages:", error)
      }
    }, 2500)
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!newMessageText.trim() && !attachedFile) return

    let finalContent = newMessageText.trim()
    if (attachedFile) {
      finalContent = `${finalContent ? finalContent + " " : ""}[Shared Document: ${attachedFile.name}]`
    }

    const messageContent = finalContent
    setNewMessageText("")
    setAttachedFile(null)

    // Optimistic message update
    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      id: tempId,
      senderId: userId,
      receiverId: activeConversationId,
      content: messageContent,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])

    try {
      const response = await fetch(`http://localhost:3001/messaging/${activeConversationId}/send-ajax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        )
        fetchConversations(false)
        lastPollTimeRef.current = Date.now()
      } else {
        toast.error("Failed to send message")
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Network error while sending message")
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const handleAttachFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setTimeout(() => {
      setAttachedFile({ name: file.name, size: file.size })
      setUploadingFile(false)
      setIsAttachOpen(false)
      toast.success(`Attached "${file.name}" to message.`)
    }, 1000)
  }

  const getUserInitials = (user) => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
  }

  const getPartnerDisplayName = () => {
    if (!conversationPartner) return ""
    return `${conversationPartner.firstName || ""} ${conversationPartner.lastName || ""}`.trim()
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* LEFT SIDEBAR */}
      <div className={`w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
        activeConversationId ? "hidden lg:flex" : "flex"
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" /> Messages
          </h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search or start new chat..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim().length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                Search Results
              </div>
              {isSearching ? (
                <div className="text-center text-xs py-4 text-slate-400">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-xs py-4 text-slate-400">No users found</div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    onClick={() => handleStartChat(user)}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
                  <h3 className="font-semibold text-sm">No chats found</h3>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                    Search for legal professionals or visitors in the search bar above to initiate a chat.
                  </p>
                </div>
              ) : (
                conversations.map((chat) => {
                  const partner = chat.user
                  const isSelected = activeConversationId === partner.id
                  const hasUnread = chat.unreadCount > 0

                  return (
                    <div
                      key={partner.id}
                      className={`flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition relative ${
                        isSelected ? "bg-blue-50/35 dark:bg-blue-950/20 border-l-4 border-blue-600" : ""
                      }`}
                      onClick={() => {
                        setActiveConversationId(partner.id)
                        setConversationPartner(partner)
                      }}
                    >
                      <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                          {getUserInitials(partner)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className={`text-sm font-semibold truncate ${
                            hasUnread ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-800 dark:text-slate-200"
                          }`}>
                            {partner.firstName} {partner.lastName}
                          </h4>
                          {chat.lastMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs truncate flex-1 ${
                            hasUnread ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-500 dark:text-slate-400"
                          }`}>
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                          {hasUnread && (
                            <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[9px] flex items-center justify-center">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className={`flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col ${
        !activeConversationId ? "hidden lg:flex" : "flex"
      }`}>
        {activeConversationId && conversationPartner ? (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 text-slate-500"
                  onClick={() => {
                    stopPolling()
                    setActiveConversationId(null)
                    setConversationPartner(null)
                    fetchConversations(false)
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                    {getUserInitials(conversationPartner)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {getPartnerDisplayName()}
                  </h3>
                  <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                    {conversationPartner.role === "lawyer" ? (
                      <>
                        <ShieldCheck className="h-3 w-3 text-green-600" /> Verified Advocate
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 text-slate-400" /> Member Client
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Extra Header Actions */}
              <Dialog open={isAttachOpen} onOpenChange={setIsAttachOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                    <Paperclip className="h-4.5 w-4.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[360px]">
                  <DialogHeader>
                    <DialogTitle>Share File or Document</DialogTitle>
                    <DialogDescription>
                      Upload legal briefs, claims documents, or case images.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition relative">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAttachFile}
                    />
                    <File className="h-10 w-10 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-500">
                      {uploadingFile ? "Uploading..." : "Click to select a file"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">PDF, DOCX, PNG (Max 10MB)</span>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-400">Loading conversation history...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs flex-col">
                  <MessageSquare className="h-8 w-8 mb-2 text-slate-300 animate-bounce" />
                  No messages exchanged. Send a message to start conversing!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderId === userId
                  const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[75%] ${isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {getUserInitials(conversationPartner)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                        </div>
                        <span className={`text-[9px] text-slate-400 block mt-1 ${isOwnMessage ? "text-right" : ""}`}>
                          {formattedTime}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Typing indicator state */}
              {isPartnerTyping && (
                <div className="flex gap-3 max-w-[75%] mr-auto items-center">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials(conversationPartner)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 dark:bg-slate-900 border px-3 py-2 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input panel with optional attachment indicator */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              {attachedFile && (
                <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between border-b text-xs text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <File className="h-4 w-4" /> Ready to share: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-500" onClick={() => setAttachedFile(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
                <Input
                  placeholder={`Message ${getPartnerDisplayName()}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 focus-visible:ring-1"
                />
                <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shadow">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-8 text-center">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-md border mb-4">
              <Scale className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Your Legal Network Mailbox</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Select an attorney or client conversation from the left to start sending secure messages. You can search to begin new chats.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
