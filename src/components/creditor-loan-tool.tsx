
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getLoanAssessment, type AIState } from '@/app/(app)/loan-requests/actions';
import type { LoanApplication } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, ThumbsDown, ThumbsUp, Send, FileText, UserPlus, Zap } from 'lucide-react';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useSubscription } from '@/hooks/use-subscription';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Get AI Recommendation
    </Button>
  );
}

function RecommendationResult({ data, loanId, request }: { data: AIState['data'], loanId: string, request: LoanApplication }) {
  if (!data) return null;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modifiedTerms, setModifiedTerms] = useState(data.modifiedTerms || '');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const getBadgeVariant = () => {
    switch (data.recommendation) {
      case 'approve':
        return 'default';
      case 'modify':
        return 'secondary';
      case 'reject':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setLoadingAction(status);
    try {
      const loanRef = doc(db, 'loan_applications', loanId);
      await updateDoc(loanRef, { status });
      toast({
        title: 'Success',
        description: `Loan has been ${status}.`,
      });
    } catch (error) {
      console.error(`Error updating loan:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: `Error ${status === 'approved' ? 'approving' : 'rejecting'} loan`,
        description: errorMessage,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleModifyAndSend = async (updateData: Partial<LoanApplication>) => {
    setLoadingAction('modify');
    try {
      const loanRef = doc(db, 'loan_applications', loanId);
      await updateDoc(loanRef, {
        status: 'modified',
        ...updateData,
      });
      toast({
        title: 'Sent to Applicant',
        description: `Modification proposal has been sent to ${request.applicant.name}.`,
      });
    } catch (error) {
      console.error(`Error updating loan:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: `Error sending modification`,
        description: errorMessage,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="mt-6 space-y-4 rounded-lg border bg-secondary/50 p-4">
      <h4 className="font-bold font-headline">AI Recommendation</h4>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Status:</span>
        <Badge variant={getBadgeVariant()} className="capitalize">
          {data.recommendation}
        </Badge>
      </div>
      <div>
        <h5 className="font-semibold">Justification:</h5>
        <p className="text-sm text-muted-foreground">{data.justification}</p>
      </div>

      {data.recommendation === 'modify' && (
        <div className="space-y-4">
            {data.requireCoMaker && (
                 <Alert variant="default" className="bg-background">
                    <UserPlus className="h-4 w-4" />
                    <AlertTitle>AI Suggestion: Co-maker</AlertTitle>
                    <AlertDescription>
                        The AI suggests requiring a co-maker to mitigate risk.
                    </AlertDescription>
                </Alert>
            )}
             {data.requireDocuments && (
                 <Alert variant="default" className="bg-background">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>AI Suggestion: Documents</AlertTitle>
                    <AlertDescription>
                        The AI suggests requesting additional documents (e.g., proof of income).
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="modified-terms">Custom Terms / Message to Applicant:</Label>
              <Textarea id="modified-terms" value={modifiedTerms} onChange={(e) => setModifiedTerms(e.target.value)} className="bg-background" rows={3} placeholder="e.g., Interest rate adjusted to 6%. Please provide proof of income."/>
            </div>
        </div>
      )}
      
      <div className="flex gap-2 pt-4 flex-wrap">
        <Button size="sm" onClick={() => handleDecision('approved')} disabled={!!loadingAction || request.status !== 'pending'}>
          {loadingAction === 'approved' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4" />}
          Approve
        </Button>
       
        {data.recommendation === 'modify' && modifiedTerms && (
          <Button size="sm" variant="outline" onClick={() => handleModifyAndSend({ modifiedTerms })} disabled={!!loadingAction || request.status !== 'pending'}>
            {loadingAction === 'modify' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Send Custom Offer
          </Button>
        )}
         <Button size="sm" variant="outline" onClick={() => handleModifyAndSend({ requiresDocuments: true, modifiedTerms: 'Please upload additional documents for review.' })} disabled={!!loadingAction || request.status !== 'pending'}>
            {loadingAction === 'request-docs' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4" />}
            Request Documents
        </Button>
         <Button size="sm" variant="outline" onClick={() => handleModifyAndSend({ requiresCoMaker: true, modifiedTerms: 'Please add a co-maker to your application.' })} disabled={!!loadingAction || request.status !== 'pending'}>
            {loadingAction === 'request-comaker' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
            Request Co-maker
        </Button>

        <Button size="sm" variant="destructive" onClick={() => handleDecision('rejected')} disabled={!!loadingAction || request.status !== 'pending'}>
           {loadingAction === 'rejected' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsDown className="mr-2 h-4 w-4" />}
          Reject
        </Button>
      </div>
    </div>
  );
}

function UpgradeToProCard() {
    return (
        <Card className="mt-6 bg-gradient-to-br from-accent/20 to-primary/10 border-accent/50">
            <CardHeader>
                <CardTitle className="font-headline text-accent flex items-center gap-2">
                    <Zap className="h-6 w-6"/>
                    Upgrade to Pro
                </CardTitle>
                <CardDescription>
                    Unlock AI-powered loan assessments to make smarter decisions, faster.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Our AI assistant can analyze loan applications and provide you with a recommendation and justification in seconds.
                </p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/billing">Upgrade Now</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


type Props = {
  request: LoanApplication;
};

export function CreditorLoanTool({ request }: Props) {
  const { subscription, loading } = useSubscription();
  const initialState: AIState = {
    data: null,
    error: null,
    loading: false,
  };
  const [state, formAction] = useFormState(getLoanAssessment, initialState);

  const loanDetailsString = `Amount: $${request.amount}, Term: ${request.termMonths} months, Interest: ${request.interestRate}%, Purpose: ${request.purpose}`;

  if (loading) {
    return (
        <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
        </div>
    );
  }

  if (subscription.plan === 'Free') {
    return <UpgradeToProCard />;
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="font-headline">AI-Powered Assessment</CardTitle>
        <CardDescription>
          Use our AI tool to get a recommendation for this loan application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="loanApplicationDetails" value={loanDetailsString} />
          <input type="hidden" name="applicantCreditHistory" value={request.creditHistory} />
          <input type="hidden" name="currentMarketConditions" value={request.marketConditions} />
          <SubmitButton />
        </form>

        {state.error && <p className="mt-4 text-sm text-destructive">{state.error}</p>}
        <RecommendationResult data={state.data} loanId={request.id} request={request} />
      </CardContent>
    </Card>
  );
}
