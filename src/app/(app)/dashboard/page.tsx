
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Loader2 } from 'lucide-react';
import type { LoanApplication } from '@/lib/types';
import { OutstandingLoanCard } from '@/components/dashboard/outstanding-loan-card';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // This query fetches loans where the current user is the BORROWER and the loan is approved OR modified.
    const q = query(
      collection(db, 'loan_applications'),
      where('applicant.uid', '==', user.uid),
      where('status', 'in', ['approved', 'modified'])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loansData: LoanApplication[] = [];
      querySnapshot.forEach((doc) => {
        loansData.push({ id: doc.id, ...doc.data() } as LoanApplication);
      });
      setLoans(loansData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  // Mocked data for today's receivables
  const todaysReceivables = 1250.0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a summary of your loan activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Receivables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {preferencesLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-4xl font-bold text-accent">
                {formatCurrency(todaysReceivables, preferences.currency)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total amount due today.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline tracking-tight mb-4">
          My Outstanding Loans
        </h2>
        {loading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
           </div>
        ) : loans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loans.map((loan) => (
              <OutstandingLoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You have no outstanding loans.</p>
        )}
      </div>
    </div>
  );
}
