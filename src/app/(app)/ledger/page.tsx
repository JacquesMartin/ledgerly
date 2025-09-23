
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { LoanApplication } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LedgerPage() {
  const { user } = useAuth();
  const { preferences, loading: prefLoading } = useUserPreferences();
  const [transactions, setTransactions] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const applicantQuery = query(collection(db, 'loan_applications'), where('applicant.uid', '==', user.uid));
    const creditorQuery = query(collection(db, 'loan_applications'), where('creditorId', '==', user.uid));

    const unsubscribeApplicant = onSnapshot(applicantQuery, (snapshot) => {
      const applicantLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
      setTransactions(prev => {
        const otherLoans = prev.filter(t => t.creditorId === user.uid);
        const combined = [...otherLoans, ...applicantLoans].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        return combined;
      });
       setLoading(false);
    });

    const unsubscribeCreditor = onSnapshot(creditorQuery, (snapshot) => {
      const creditorLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
       setTransactions(prev => {
        const otherLoans = prev.filter(t => t.applicant.uid === user.uid);
        const combined = [...otherLoans, ...creditorLoans].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        return combined;
      });
       setLoading(false);
    });

    return () => {
      unsubscribeApplicant();
      unsubscribeCreditor();
    };

  }, [user]);

  const getStatusVariant = (status: LoanApplication['status']) => {
    switch (status) {
        case 'approved':
        case 'modified':
            return 'secondary';
        case 'pending':
            return 'outline';
        case 'rejected':
            return 'destructive';
        default:
            return 'default';
    }
  }


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Transaction Ledger</h1>
        <p className="text-muted-foreground">A complete history of your loan activities.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            This table shows all loans you've applied for and all loans you've issued.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading || prefLoading ? (
                    [...Array(5)].map((_, i) => (
                         <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : transactions.length > 0 ? (
                    transactions.map((tx) => {
                        const isBorrower = tx.applicant.uid === user?.uid;
                        return (
                            <TableRow key={tx.id}>
                                <TableCell className="font-medium text-muted-foreground">
                                    {format(parseISO(tx.date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {isBorrower ? `Loan from ${tx.applicant.name}` : `Loan to ${tx.applicant.name}`}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{tx.purpose}</div>
                                </TableCell>
                                <TableCell>
                                    {isBorrower ? (
                                        <Badge variant="outline" className="text-destructive-foreground bg-destructive/10 border-destructive/20">
                                            <ArrowDownLeft className="mr-1 h-3 w-3" />
                                            Outgoing
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                                             <ArrowUpRight className="mr-1 h-3 w-3" />
                                            Incoming
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(tx.status)} className="capitalize">{tx.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {formatCurrency(tx.amount, preferences.currency)}
                                </TableCell>
                            </TableRow>
                        )
                    })
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                        You have no transactions yet.
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
