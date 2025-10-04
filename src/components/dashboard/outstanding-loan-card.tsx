
import type { LoanApplication } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { CalendarDays, GitPullRequest, Loader2, ThumbsUp, FileText, UserPlus } from 'lucide-react';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

function ModifiedLoanDialog({ loan, onAccepted }: { loan: LoanApplication, onAccepted: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { preferences, loading: preferencesLoading } = useUserPreferences();

  const handleAccept = async () => {
    setLoading(true);
    try {
      const loanRef = doc(db, 'loan_applications', loan.id);
      await updateDoc(loanRef, { 
          status: 'approved',
          requiresCoMaker: false,
          requiresDocuments: false,
      });
      toast({
        title: 'Success',
        description: 'You have accepted the modified loan terms.',
      });
      onAccepted();
    } catch (error) {
      console.error('Error accepting terms:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  const renderModificationDetails = () => {
      if (loan.requiresDocuments) {
          return (
             <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Documents Required</h4>
                <p>The creditor has requested additional documents. Please upload them to continue.</p>
                {/* In a real app, you would have a file upload component here */}
                <Button className="mt-4" size="sm">Upload Documents</Button>
            </div>
          )
      }
      if (loan.requiresCoMaker) {
          return (
             <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Co-maker Required</h4>
                <p>The creditor has requested a co-maker for this loan. Please provide co-maker details to continue.</p>
                {/* In a real app, you would have a form here */}
                <Button className="mt-4" size="sm">Add Co-maker</Button>
            </div>
          )
      }
       if (loan.modifiedTerms) {
          return (
             <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold mb-2 text-accent">New Offer</h4>
                <p className="whitespace-pre-wrap">{loan.modifiedTerms}</p>
            </div>
          )
      }
      return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm"><GitPullRequest className="mr-2 h-4 w-4" />Review Offer</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Modified Loan Offer</AlertDialogTitle>
          <AlertDialogDescription>
            The creditor has proposed new terms for your loan. Please review them carefully.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-4 text-sm">
          <div className="p-4 rounded-md bg-muted/50 border">
            <h4 className="font-semibold mb-2">Original Request</h4>
            <p>{preferencesLoading ? <Skeleton className="h-5 w-48"/> : `${formatCurrency(loan.amount, preferences.currency)} for ${loan.termMonths} months at ${loan.interestRate}%`}</p>
          </div>
          {renderModificationDetails()}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {loan.modifiedTerms && (
            <AlertDialogAction onClick={handleAccept} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                Accept & Finalize
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


type Props = {
  loan: LoanApplication;
};

export function OutstandingLoanCard({ loan }: Props) {
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const [isLoanAccepted, setIsLoanAccepted] = useState(loan.status !== 'modified');

  const dueDate = parseISO(loan.dueDate);
  const isOverdue = new Date() > dueDate;

  const handleAccepted = () => {
    setIsLoanAccepted(true);
  }

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
        ) : isLoanAccepted ? (
          <Badge variant="secondary">{loan.status}</Badge>
        ) : (
          <Badge variant="outline" className="text-blue-600 border-blue-600">Action Required</Badge>
        )}

        {isLoanAccepted ? (
           <Button variant="ghost" size="sm">View Details</Button>
        ) : (
          <ModifiedLoanDialog loan={loan} onAccepted={handleAccepted} />
        )}
      </CardFooter>
    </Card>
  );
}
