"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  BellOff,
  CheckCheck,
  Clock,
  Info,
  UserPlus,
  Briefcase,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all | unread

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/notifications?format=json", {
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        toast.error(data.error || "Failed to load notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Network error loading notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch("http://localhost:3001/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ notificationId }),
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("http://localhost:3001/notifications/mark-all-read", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error("Error marking all:", error)
      toast.error("Failed to mark all as read")
    }
  }

  const getNotificationIcon = (title) => {
    const t = (title || "").toLowerCase()
    if (t.includes("connect") || t.includes("network")) return { icon: UserPlus, color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400" }
    if (t.includes("job") || t.includes("case") || t.includes("hire")) return { icon: Briefcase, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400" }
    if (t.includes("message") || t.includes("chat")) return { icon: MessageCircle, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400" }
    if (t.includes("verif") || t.includes("approv")) return { icon: ShieldCheck, color: "text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400" }
    if (t.includes("warn") || t.includes("reject")) return { icon: AlertTriangle, color: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400" }
    return { icon: Info, color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400" }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">
                  You have{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">{unreadCount}</span>{" "}
                  unread
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs font-bold rounded-md"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs font-bold rounded-md"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-bold"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          {loading ? (
            <CardContent className="p-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800/50 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          ) : filtered.length === 0 ? (
            <CardContent className="py-16 text-center">
              <BellOff className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {filter === "unread"
                  ? "You're all caught up! Switch to 'All' to see past notifications."
                  : "When you receive connection requests, job updates, or verification alerts, they'll appear here."}
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.title)
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                      !notification.isRead
                        ? "bg-blue-50/30 dark:bg-blue-950/10 border-l-3 border-l-blue-600"
                        : ""
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm leading-tight ${
                            !notification.isRead
                              ? "font-extrabold text-slate-900 dark:text-slate-100"
                              : "font-semibold text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {notification.message && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                      )}

                      {!notification.isRead && (
                        <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0 text-[9px] font-bold">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          )}
        </Card>

        {/* Footer hint */}
        {!loading && filtered.length > 0 && (
          <div className="text-center py-6">
            <p className="text-slate-400 text-xs font-bold flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" /> You're all caught up
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
