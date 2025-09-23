
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Creditor, LoanApplication } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loadingCreditors, setLoadingCreditors] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const [selectedCreditor, setSelectedCreditor] = useState('');
  const [amount, setAmount] = useState(5000);
  const [term, setTerm] = useState(24);
  const [interestRate, setInterestRate] = useState(5);
  const [purpose, setPurpose] = useState('');


  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/creditors`), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const creditorsData: Creditor[] = [];
      querySnapshot.forEach((doc) => {
        creditorsData.push({ id: doc.id, ...doc.data() } as Creditor);
      });
      setCreditors(creditorsData);
      setLoadingCreditors(false);
    });

    return () => unsubscribe();
  }, [user]);

  const estimatedMonthlyPayment = useMemo(() => {
    if (amount <= 0 || term <= 0 || interestRate <= 0) {
      return 0;
    }
    const annualInterestRate = interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const totalPayments = term;
    
    const monthlyPayment =
      amount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);

    return monthlyPayment;
  }, [amount, term, interestRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCreditor || !amount || !term || !purpose) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }
    setFormLoading(true);

    try {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + term);

      const loanApplication: Omit<LoanApplication, 'id'> = {
        applicant: {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
          avatarHint: 'person face'
        },
        creditorId: selectedCreditor,
        amount,
        termMonths: term,
        interestRate,
        purpose,
        status: 'pending',
        date: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        creditHistory: 'Credit history not available yet. This will be implemented later.',
        marketConditions: 'Market conditions not available yet. This will be implemented later.',
      };

      await addDoc(collection(db, 'loan_applications'), {
        ...loanApplication,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Success',
        description: 'Your loan application has been submitted!',
      });
      
      // Reset form
      setSelectedCreditor('');
      setAmount(5000);
      setTerm(24);
      setInterestRate(5);
      setPurpose('');

    } catch (error) {
      console.error('Error submitting application: ', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error submitting application',
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Apply for a Loan</h1>
        <p className="text-muted-foreground">Fill out the form below to submit your loan application.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
            <CardDescription>
              Your application will be sent to the selected creditor for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="creditor">Select Creditor</Label>
                <Select value={selectedCreditor} onValueChange={setSelectedCreditor}>
                  <SelectTrigger id="creditor">
                    <SelectValue placeholder="Choose a creditor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCreditors ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      creditors.map((creditor) => (
                        <SelectItem key={creditor.id} value={creditor.id}>
                          {creditor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Loan Amount ({preferences.currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 5000"
                    onChange={(e) => setAmount(Number(e.target.value))}
                    value={amount || ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="term">Payment Term (months)</Label>
                  <Input
                    id="term"
                    type="number"
                    placeholder="e.g., 24"
                    onChange={(e) => setTerm(Number(e.target.value))}
                    value={term || ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    placeholder="e.g., 5"
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    value={interestRate || ''}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purpose">Purpose of Loan</Label>
                <Textarea id="purpose" placeholder="e.g., To cover expenses for a home renovation project." value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>

              <Button type="submit" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={formLoading}>
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 bg-secondary/50">
          <CardHeader>
            <CardTitle>Loan Preview</CardTitle>
            <CardDescription>
              An estimated preview of your loan repayment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Loan Amount</div>
              {preferencesLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(amount, preferences.currency)}
                </div>
              )}
            </div>
             <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Interest Rate</div>
              <div className="text-2xl font-bold">{interestRate || '0'}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Payment Term</div>
              <div className="text-2xl font-bold">{term || '0'} months</div>
            </div>
            <div className="space-y-1 pt-4 border-t">
              <div className="text-sm text-muted-foreground">Estimated Monthly Payment*</div>
               {preferencesLoading ? (
                <Skeleton className="h-9 w-36" />
              ) : (
                <div className="text-3xl font-bold text-accent">
                  {formatCurrency(estimatedMonthlyPayment, preferences.currency)}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">
              *Actual terms may vary.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
