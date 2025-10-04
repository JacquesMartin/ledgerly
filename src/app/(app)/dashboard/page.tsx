
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Loader2 } from 'lucide-react';
import type { LoanApplication } from '@/lib/types';
import { OutstandingLoanCard } from '@/components/dashboard/outstanding-loan-card';
import { useAuth } from '@/hooks/use-auth-supabase';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { CreditorLoansTable } from '@/components/dashboard/creditor-loans-table';

export default function DashboardPage() {
  const { user } = useAuth();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  
  // Loans where user is the applicant
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [loadingMyLoans, setLoadingMyLoans] = useState(true);

  // Loans where user is the creditor
  const [issuedLoans, setIssuedLoans] = useState<LoanApplication[]>([]);
  const [loadingIssuedLoans, setLoadingIssuedLoans] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingMyLoans(true);

    const fetchMyLoans = async () => {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('applicant_id', user.id)
        .in('status', ['approved', 'modified']);

      if (error) {
        console.error('Error fetching my loans:', error);
      } else {
        setMyLoans(data || []);
      }
      setLoadingMyLoans(false);
    };

    fetchMyLoans();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingIssuedLoans(true);
    
    const fetchIssuedLoans = async () => {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('creditor_id', user.id)
        .in('status', ['approved', 'modified']);

      if (error) {
        console.error('Error fetching issued loans:', error);
      } else {
        setIssuedLoans(data || []);
      }
      setLoadingIssuedLoans(false);
    };

    fetchIssuedLoans();
  }, [user]);
  
  const todaysReceivables = issuedLoans.reduce((total, loan) => {
    // This is a simplified calculation. A real app would check for payments due *today*.
    // For now, we'll sum up a fraction of all active issued loans.
    const monthlyPayment = loan.amount * (loan.interest_rate / 100 / 12);
    return total + monthlyPayment;
  }, 0);


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
            {preferencesLoading || loadingIssuedLoans ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-4xl font-bold text-accent">
                {formatCurrency(todaysReceivables, preferences.currency)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Estimated receivables from active loans.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline tracking-tight mb-4">
          My Outstanding Loans
        </h2>
        {loadingMyLoans ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
           </div>
        ) : myLoans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myLoans.map((loan) => (
              <OutstandingLoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You have no outstanding loans.</p>
        )}
      </div>

       <div>
        <h2 className="text-2xl font-bold font-headline tracking-tight mb-4">
          Active Loans Issued
        </h2>
        <CreditorLoansTable loans={issuedLoans} loading={loadingIssuedLoans} />
      </div>
    </div>
  );
}
