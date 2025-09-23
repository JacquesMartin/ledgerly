
'use client';

import { useState } from 'react';
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
import type { UserPreferences } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/use-user-preferences';

export default function ProfilePage() {
  const { toast } = useToast();
  const { preferences, setCurrency, loading, saving } = useUserPreferences();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await setCurrency(preferences.currency);
    if (success) {
      toast({
        title: 'Success!',
        description: 'Your currency setting has been saved.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: 'An unknown error occurred.',
      });
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
