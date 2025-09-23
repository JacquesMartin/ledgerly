
import type { LoanApplication } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type Props = {
  loan: LoanApplication;
};

export function OutstandingLoanCard({ loan }: Props) {
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const dueDate = parseISO(loan.dueDate);
  const isOverdue = new Date() > dueDate;

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={loan.applicant.avatarUrl} alt={loan.applicant.name} data-ai-hint={loan.applicant.avatarHint} />
          <AvatarFallback>{loan.applicant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline">{loan.applicant.name}</CardTitle>
          {preferencesLoading ? (
            <Skeleton className="h-7 w-24 mt-1" />
          ) : (
            <CardDescription className="text-2xl font-bold text-accent">
              {formatCurrency(loan.amount, preferences.currency)}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Due on {format(dueDate, 'MMMM d, yyyy')}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
            Purpose: {loan.purpose}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {isOverdue ? (
          <Badge variant="destructive">Overdue</Badge>
        ) : (
          <Badge variant="secondary">{loan.status}</Badge>
        )}
        <Button variant="ghost" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}
