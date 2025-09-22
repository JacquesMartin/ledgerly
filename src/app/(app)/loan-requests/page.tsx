
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LoanApplication } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { CreditorLoanTool } from '@/components/creditor-loan-tool';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoanRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // This query fetches pending loan requests where the current user is listed as the CREDITOR.
    const q = query(
      collection(db, 'loan_applications'),
      where('creditorId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: LoanApplication[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as LoanApplication);
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Loan Requests</h1>
        <p className="text-muted-foreground">Review and process incoming loan applications.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : requests.length > 0 ? (
         <Accordion type="single" collapsible className="w-full">
          {requests.map((request) => (
            <AccordionItem value={request.id} key={request.id}>
              <AccordionTrigger className="hover:bg-card hover:no-underline rounded-md px-4 py-3 data-[state=open]:bg-card">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={request.applicant.avatarUrl} alt={request.applicant.name} data-ai-hint={request.applicant.avatarHint} />
                      <AvatarFallback>{request.applicant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{request.applicant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Requested on {format(parseISO(request.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg text-accent">
                    ${request.amount.toLocaleString()}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-card p-4 md:p-6 border-t">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-muted-foreground text-sm">Loan Details</h4>
                    <p>
                      ${request.amount.toLocaleString()} for {request.termMonths} months at {request.interestRate}%
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground text-sm">Loan Purpose</h4>
                    <p>{request.purpose}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground text-sm">Applicant Credit History</h4>
                    <p>{request.creditHistory}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground text-sm">Market Conditions</h4>
                    <p>{request.marketConditions}</p>
                  </div>
                </div>
                <CreditorLoanTool request={request} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
         <div className="text-center py-12">
            <p className="text-muted-foreground">You have no pending loan requests.</p>
         </div>
      )}
    </div>
  );
}
