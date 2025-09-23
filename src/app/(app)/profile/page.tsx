
'use client';

import { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserPreferences } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<UserPreferences['currency']>('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPreferences = async () => {
      setLoading(true);
      const prefDocRef = doc(db, `user_preferences/${user.uid}`);
      const prefDoc = await getDoc(prefDocRef);
      if (prefDoc.exists()) {
        const prefs = prefDoc.data() as UserPreferences;
        setCurrency(prefs.currency);
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save settings.',
      });
      return;
    }
    setSaving(true);
    try {
      const prefDocRef = doc(db, `user_preferences/${user.uid}`);
      await setDoc(prefDocRef, { currency }, { merge: true });
      toast({
        title: 'Success!',
        description: 'Your currency setting has been saved.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and currency settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Select your preferred currency for the application.
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
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as UserPreferences['currency'])}>
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
