
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth-supabase';
import { supabase } from '@/lib/supabase';
import type { UserPreferences } from '@/lib/types';

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  saving: boolean;
  setCurrency: (currency: UserPreferences['currency'], save?: boolean) => Promise<boolean>;
}

const defaultPreferences: UserPreferences = {
  currency: 'USD',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      setLoading(true);
      const prefDocRef = doc(db, `user_preferences/${user.uid}`);
      const prefDoc = await getDoc(prefDocRef);
      if (prefDoc.exists()) {
        setPreferences(prefDoc.data() as UserPreferences);
      } else {
        setPreferences(defaultPreferences);
      }
      setLoading(false);
    };

    fetchPreferences();
  }, [user]);

  const setCurrency = useCallback(async (currency: UserPreferences['currency'], save = true) => {
    setPreferences((prev) => ({ ...prev, currency }));
    
    if (save && user) {
      setSaving(true);
      try {
        const prefDocRef = doc(db, `user_preferences/${user.uid}`);
        await setDoc(prefDocRef, { currency }, { merge: true });
        return true;
      } catch (error) {
        console.error("Error saving currency:", error);
        return false;
      } finally {
        setSaving(false);
      }
    }
    return true;
  }, [user]);

  const value = {
    preferences,
    loading,
    saving,
    setCurrency,
  };

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
