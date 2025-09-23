
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserPreferences, UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { preferences, setCurrency, loading: prefLoading, saving: prefSaving } = useUserPreferences();
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);


  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user]);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({...prev, [field]: value}));
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const currencySuccess = await setCurrency(preferences.currency);

    if (!user) {
        toast({variant: "destructive", title: "Error", description: "You must be logged in."});
        return;
    }
    setSavingProfile(true);
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, profile, { merge: true });
        if (currencySuccess) {
            toast({
                title: 'Success!',
                description: 'Your settings have been saved.',
            });
        }
    } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
         toast({
            variant: 'destructive',
            title: 'Error saving profile',
            description: errorMessage,
         });
    } finally {
        setSavingProfile(false);
    }
  };

  const loading = authLoading || prefLoading || loadingProfile;
  const saving = prefSaving || savingProfile;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and profile settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            This information may be shared with creditors when you apply for a loan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="max-w-md space-y-4">
              <div className="grid gap-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" value={profile.name || ''} onChange={e => handleProfileChange('name', e.target.value)} />
              </div>
               <div className="grid gap-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" value={profile.email || ''} disabled />
              </div>
               <div className="grid gap-2">
                 <Label htmlFor="contactNumber">Contact Number</Label>
                 <Input id="contactNumber" value={profile.contactNumber || ''} onChange={e => handleProfileChange('contactNumber', e.target.value)} />
              </div>
               <div className="grid gap-2">
                 <Label htmlFor="address">Address</Label>
                 <Textarea id="address" value={profile.address || ''} onChange={e => handleProfileChange('address', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={preferences.currency}
                  onValueChange={(value) =>
                    setCurrency(value as UserPreferences['currency'], false)
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($) - United States Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
