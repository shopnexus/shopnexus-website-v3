"use client"

import { useMemo } from "react"
import {
  useListNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  Notification,
} from "@/core/account/notification"
import { formatTimeAgo } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Bell,
  Package,
  RotateCcw,
  MessageCircle,
  Tag,
  CheckCheck,
  Loader2,
} from "lucide-react"

const typeIcons: Record<string, typeof Bell> = {
  order_confirmed: Package,
  order_cancelled: Package,
  order_shipped: Package,
  order_delivered: Package,
  refund_approved: RotateCcw,
  refund_rejected: RotateCcw,
  new_message: MessageCircle,
  promotion: Tag,
}

function getNotificationIcon(type: string) {
  return typeIcons[type] ?? Bell
}

export default function NotificationsPage() {
  const {
    data: notificationsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListNotifications({ limit: 20 })

  const { data: unreadData } = useUnreadCount()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const notifications = useMemo(() => {
    return notificationsData?.pages.flatMap((page) => page.data) ?? []
  }, [notificationsData])

  const unreadCount = unreadData?.count ?? 0

  const handleMarkRead = (notification: Notification) => {
    if (!notification.is_read) {
      markRead.mutate({ ids: [notification.id] })
    }
  }

  const handleMarkAllRead = () => {
    markAllRead.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your orders and messages
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onMarkRead={handleMarkRead}
      />
    </div>
  )
}

function NotificationList({
  notifications,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onMarkRead,
}: {
  notifications: Notification[]
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  onMarkRead: (notification: Notification) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
        <p className="text-muted-foreground">
          When you receive notifications, they will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type)
        return (
          <Card
            key={notification.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              !notification.is_read && "border-primary/30 bg-primary/5"
            )}
            onClick={() => onMarkRead(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                    !notification.is_read
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.is_read ? "font-semibold" : "font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notification.date_created)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
