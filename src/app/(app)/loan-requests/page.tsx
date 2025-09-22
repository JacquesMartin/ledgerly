import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { loanRequests } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { CreditorLoanTool } from '@/components/creditor-loan-tool';

export default function LoanRequestsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Loan Requests</h1>
        <p className="text-muted-foreground">Review and process incoming loan applications.</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {loanRequests.map((request) => (
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
                    ${request.amount.toLocaleString()} for {request.termMonths} months
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
    </div>
  );
}
