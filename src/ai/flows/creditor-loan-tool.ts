// Creditor-loan-tool.ts
'use server';

/**
 * @fileOverview An AI tool for creditors to assess loan applications.
 *
 * - assessLoanApplication - A function that assesses loan applications and provides recommendations.
 * - AssessLoanApplicationInput - The input type for the assessLoanApplication function.
 * - AssessLoanApplicationOutput - The return type for the assessLoanApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessLoanApplicationInputSchema = z.object({
  loanApplicationDetails: z
    .string()
    .describe('Details of the loan application including amount, interest rate, payment schedule, and applicant information.'),
  applicantCreditHistory: z
    .string()
    .describe('The credit history of the loan applicant.'),
  currentMarketConditions: z
    .string()
    .describe('Information about the current market conditions and interest rates.'),
});
export type AssessLoanApplicationInput = z.infer<typeof AssessLoanApplicationInputSchema>;

const AssessLoanApplicationOutputSchema = z.object({
  recommendation: z
    .enum(['approve', 'modify', 'reject'])
    .describe('The recommendation for the loan application: approve, modify, or reject.'),
  modifiedTerms: z
    .string()
    .optional()
    .describe('If the recommendation is to modify, provide the modified loan terms.'),
  justification: z
    .string()
    .describe('A detailed justification for the recommendation, including reasons for approval, modification, or rejection.'),
});
export type AssessLoanApplicationOutput = z.infer<typeof AssessLoanApplicationOutputSchema>;

export async function assessLoanApplication(input: AssessLoanApplicationInput): Promise<AssessLoanApplicationOutput> {
  return assessLoanApplicationFlow(input);
}

const assessLoanApplicationPrompt = ai.definePrompt({
  name: 'assessLoanApplicationPrompt',
  input: {schema: AssessLoanApplicationInputSchema},
  output: {schema: AssessLoanApplicationOutputSchema},
  prompt: `You are an AI assistant helping creditors assess loan applications. Based on the provided loan application details, applicant credit history, and current market conditions, provide a recommendation to approve, modify, or reject the loan application.

Loan Application Details: {{{loanApplicationDetails}}}
Applicant Credit History: {{{applicantCreditHistory}}}
Current Market Conditions: {{{currentMarketConditions}}}

Recommendation:
- If the applicant has a strong credit history and the loan terms are reasonable given the current market conditions, recommend approval.
- If the applicant has a moderate credit history or the loan terms are slightly unfavorable, recommend modification with specific suggestions for adjusted terms.
- If the applicant has a poor credit history or the loan terms are highly unfavorable, recommend rejection.

Justification: Provide a clear and concise justification for your recommendation. If modifying the terms, explain why the changes are necessary and how they align with the applicant's credit history and current market conditions.

Output should be JSON format.`,
});

const assessLoanApplicationFlow = ai.defineFlow(
  {
    name: 'assessLoanApplicationFlow',
    inputSchema: AssessLoanApplicationInputSchema,
    outputSchema: AssessLoanApplicationOutputSchema,
  },
  async input => {
    const {output} = await assessLoanApplicationPrompt(input);
    return output!;
  }
);
