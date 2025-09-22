
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Creditor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreditorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/creditors`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const creditorsData: Creditor[] = [];
      querySnapshot.forEach((doc) => {
        creditorsData.push({ id: doc.id, ...doc.data() } as Creditor);
      });
      setCreditors(creditorsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCreditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email || !name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name and email are required.',
      });
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/creditors`), {
        name,
        email,
        status: 'approved',
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Success',
        description: 'Creditor added to your personal network.',
      });
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error adding creditor: ', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error adding creditor',
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Creditors</h1>
        <p className="text-muted-foreground">Add new creditors to your personal network.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a New Creditor</CardTitle>
          <CardDescription>Enter the name and email of the creditor you want to add.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCreditor} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="name">Creditor&apos;s Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="email">Creditor&apos;s Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="creditor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Add Creditor
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Creditors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  </TableRow>
                </>
              ) : creditors.length > 0 ? (
                creditors.map((creditor) => (
                  <TableRow key={creditor.id}>
                    <TableCell className="font-medium">{creditor.name}</TableCell>
                    <TableCell>{creditor.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    You haven&apos;t added any creditors yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
