'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getLoanAssessment, type AIState } from '@/app/(app)/loan-requests/actions';
import type { LoanRequest } from '@/lib/mock-data';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

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

function RecommendationResult({ data }: { data: AIState['data'] }) {
  if (!data) return null;

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
      {data.recommendation === 'modify' && data.modifiedTerms && (
        <div className="grid gap-2">
          <Label htmlFor="modified-terms">Suggested Modifications:</Label>
          <Textarea id="modified-terms" defaultValue={data.modifiedTerms} className="bg-background" rows={3}/>
        </div>
      )}
      <div className="flex gap-2 pt-4">
        <Button size="sm">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Approve
        </Button>
        {data.recommendation === 'modify' && (
          <Button size="sm" variant="outline">
            Apply Mods & Approve
          </Button>
        )}
        <Button size="sm" variant="destructive">
          <ThumbsDown className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

type Props = {
  request: LoanRequest;
};

export function CreditorLoanTool({ request }: Props) {
  const initialState: AIState = {
    data: null,
    error: null,
    loading: false,
  };
  const [state, formAction] = useFormState(getLoanAssessment, initialState);

  const loanDetailsString = `Amount: $${request.amount}, Term: ${request.termMonths} months, Purpose: ${request.purpose}`;

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
        <RecommendationResult data={state.data} />
      </CardContent>
    </Card>
  );
}
