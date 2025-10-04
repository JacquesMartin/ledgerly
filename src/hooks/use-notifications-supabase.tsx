'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth-supabase';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Fetch notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      setLoading(false);
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change:', payload);
          fetchNotifications(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('recipient_id', user.id);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (error) {
      console.error('Error creating notification:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', user.id);

    if (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
  };
}

// Helper function to create different types of notifications
export const createNotificationHelpers = (createNotification: (data: Omit<Notification, 'id' | 'created_at'>) => Promise<void>) => {
  return {
    newLoanRequest: (recipientId: string, loanId: string, applicantName: string) => 
      createNotification({
        recipient_id: recipientId,
        loan_id: loanId,
        type: 'NEW_LOAN_REQUEST',
        message: `${applicantName} has requested a loan from you`,
        is_read: false,
      }),

    loanModified: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipient_id: recipientId,
        loan_id: loanId,
        type: 'LOAN_MODIFIED',
        message: `${creditorName} has modified your loan terms`,
        is_read: false,
      }),

    loanAccepted: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipient_id: recipientId,
        loan_id: loanId,
        type: 'LOAN_ACCEPTED',
        message: `${creditorName} has accepted your loan application`,
        is_read: false,
      }),

    loanRejected: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipient_id: recipientId,
        loan_id: loanId,
        type: 'LOAN_ACCEPTED', // Using existing type, could add LOAN_REJECTED
        message: `${creditorName} has declined your loan application`,
        is_read: false,
      }),

    paymentReceived: (recipientId: string, loanId: string, payerName: string, amount: number) =>
      createNotification({
        recipient_id: recipientId,
        loan_id: loanId,
        type: 'LOAN_MODIFIED', // Using existing type, could add PAYMENT_RECEIVED
        message: `Payment of $${amount} received from ${payerName}`,
        is_read: false,
      })
  };
};

