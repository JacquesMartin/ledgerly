'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth-supabase';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types';
import { useToast } from './use-toast';

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      // Sort by createdAt in descending order (newest first)
      const sortedNotifications = notificationsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { isRead: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const notification = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create notification'
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Note: We'll need to add delete functionality to Firestore rules
      // For now, we'll mark as read instead
      await markAsRead(notificationId);
    } catch (error) {
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
    deleteNotification
  };
}

// Helper function to create different types of notifications
export const createNotificationHelpers = (createNotification: (data: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>) => {
  return {
    newLoanRequest: (recipientId: string, loanId: string, applicantName: string) => 
      createNotification({
        recipientId,
        loanId,
        type: 'NEW_LOAN_REQUEST',
        message: `${applicantName} has requested a loan from you`
      }),

    loanModified: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipientId,
        loanId,
        type: 'LOAN_MODIFIED',
        message: `${creditorName} has modified your loan terms`
      }),

    loanAccepted: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipientId,
        loanId,
        type: 'LOAN_ACCEPTED',
        message: `${creditorName} has accepted your loan application`
      }),

    loanRejected: (recipientId: string, loanId: string, creditorName: string) =>
      createNotification({
        recipientId,
        loanId,
        type: 'LOAN_ACCEPTED', // Using existing type, could add LOAN_REJECTED
        message: `${creditorName} has declined your loan application`
      }),

    paymentReceived: (recipientId: string, loanId: string, payerName: string, amount: number) =>
      createNotification({
        recipientId,
        loanId,
        type: 'LOAN_MODIFIED', // Using existing type, could add PAYMENT_RECEIVED
        message: `Payment of $${amount} received from ${payerName}`
      })
  };
};
