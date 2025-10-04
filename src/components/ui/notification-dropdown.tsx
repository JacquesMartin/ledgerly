'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';
import type { Notification } from '@/lib/types';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'NEW_LOAN_REQUEST':
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case 'LOAN_MODIFIED':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'LOAN_ACCEPTED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'NEW_LOAN_REQUEST':
      return 'border-l-blue-500';
    case 'LOAN_MODIFIED':
      return 'border-l-orange-500';
    case 'LOAN_ACCEPTED':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-500';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`p-3 border-l-4 ${getNotificationColor(notification.type)} ${
        !notification.isRead ? 'bg-muted/50' : ''
      } hover:bg-muted/80 transition-colors cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const recentNotifications = notifications.slice(0, 10);
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : recentNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You'll see loan updates here</p>
            </div>
          )}
        </ScrollArea>

        {recentNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
