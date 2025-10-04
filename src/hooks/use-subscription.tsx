
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './use-auth-supabase';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/lib/subscriptions';
import { FREE_PLAN } from '@/lib/subscriptions';

interface SubscriptionContextType {
  subscription: Subscription;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(FREE_PLAN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(FREE_PLAN);
      setLoading(false);
      return;
    }

    setLoading(true);
    // In a real app, you'd fetch the user's subscription from a 'subscriptions' collection.
    // This collection would be managed by a payment provider like Stripe via webhooks.
    // For this demo, we'll just simulate it by assuming the user has a plan or defaulting to free.
    const subDocRef = doc(db, `subscriptions/${user.uid}`);
    
    const unsubscribe = onSnapshot(subDocRef, (doc) => {
      if (doc.exists()) {
        // Assuming the document data matches the Subscription interface
        setSubscription(doc.data() as Subscription);
      } else {
        // Default to the free plan if no subscription document exists
        setSubscription(FREE_PLAN);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const value = {
    subscription,
    loading,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
