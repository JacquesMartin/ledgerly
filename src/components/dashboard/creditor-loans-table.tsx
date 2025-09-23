
'use client';

import type { LoanApplication } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format, parseISO } from 'date-fns';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

type Props = {
  loans: LoanApplication[];
  loading: boolean;
};

export function CreditorLoansTable({ loans, loading }: Props) {
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <p className="text-muted-foreground">You have not issued any active loans.</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => {
            const dueDate = parseISO(loan.dueDate);
            const isOverdue = new Date() > dueDate;
            return (
              <TableRow key={loan.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={loan.applicant.avatarUrl} alt={loan.applicant.name} data-ai-hint={loan.applicant.avatarHint} />
                      <AvatarFallback>{loan.applicant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{loan.applicant.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {preferencesLoading ? <Skeleton className="h-5 w-20 ml-auto" /> : formatCurrency(loan.amount, preferences.currency)}
                </TableCell>
                <TableCell>{format(dueDate, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                   {isOverdue ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : (
                      <Badge variant="secondary" className="capitalize">{loan.status}</Badge>
                    )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
