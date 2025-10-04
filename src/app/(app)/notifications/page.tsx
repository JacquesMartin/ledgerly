'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';
import { Check, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Notification } from '@/lib/types';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'NEW_LOAN_REQUEST':
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    case 'LOAN_MODIFIED':
      return <Clock className="h-5 w-5 text-orange-500" />;
    case 'LOAN_ACCEPTED':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'NEW_LOAN_REQUEST':
      return 'border-l-blue-500 bg-blue-50/50';
    case 'LOAN_MODIFIED':
      return 'border-l-orange-500 bg-orange-50/50';
    case 'LOAN_ACCEPTED':
      return 'border-l-green-500 bg-green-50/50';
    default:
      return 'border-l-gray-500 bg-gray-50/50';
  }
};

const getTypeLabel = (type: Notification['type']) => {
  switch (type) {
    case 'NEW_LOAN_REQUEST':
      return 'New Request';
    case 'LOAN_MODIFIED':
      return 'Loan Modified';
    case 'LOAN_ACCEPTED':
      return 'Loan Accepted';
    default:
      return 'Notification';
  }
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Notification['type']>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) || 
      (filter === 'read' && notification.isRead);
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your loan activities and creditor communications.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge variant="destructive">{unreadCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filter} onValueChange={(value: 'all' | 'unread' | 'read') => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value: 'all' | Notification['type']) => setTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="NEW_LOAN_REQUEST">New Requests</SelectItem>
                  <SelectItem value="LOAN_MODIFIED">Loan Modified</SelectItem>
                  <SelectItem value="LOAN_ACCEPTED">Loan Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredNotifications.length} Notification{filteredNotifications.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {filter === 'all' ? 'All notifications' : 
             filter === 'unread' ? 'Unread notifications only' : 
             'Read notifications only'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'bg-muted/30' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}</span>
                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No notifications found</h3>
              <p className="text-sm">
                {filter === 'all' 
                  ? "You don't have any notifications yet."
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
