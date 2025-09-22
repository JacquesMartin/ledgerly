import type { OutstandingLoan } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { CalendarDays } from 'lucide-react';

type Props = {
  loan: OutstandingLoan;
};

export function OutstandingLoanCard({ loan }: Props) {
  const dueDate = parseISO(loan.dueDate);
  const isOverdue = new Date() > dueDate;

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={loan.avatarUrl} alt={loan.name} data-ai-hint={loan.avatarHint} />
          <AvatarFallback>{loan.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline">{loan.name}</CardTitle>
          <CardDescription className="text-2xl font-bold text-accent">
            ${loan.amount.toLocaleString()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Due on {format(dueDate, 'MMMM d, yyyy')}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {isOverdue ? (
          <Badge variant="destructive">Overdue</Badge>
        ) : (
          <Badge variant="secondary">Upcoming</Badge>
        )}
        <Button variant="ghost" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
}
