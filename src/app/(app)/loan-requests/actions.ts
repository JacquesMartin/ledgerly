'use server';

import {
  assessLoanApplication,
  type AssessLoanApplicationInput,
  type AssessLoanApplicationOutput,
} from '@/ai/flows/creditor-loan-tool';

export type AIState = {
  data: AssessLoanApplicationOutput | null;
  error: string | null;
  loading: boolean;
};

export async function getLoanAssessment(
  _previousState: AIState,
  formData: FormData
): Promise<AIState> {
  const loanApplicationDetails = formData.get('loanApplicationDetails') as string;
  const applicantCreditHistory = formData.get('applicantCreditHistory') as string;
  const currentMarketConditions = formData.get('currentMarketConditions') as string;

  if (!loanApplicationDetails || !applicantCreditHistory || !currentMarketConditions) {
    return { data: null, error: 'Missing required form data.', loading: false };
  }

  const input: AssessLoanApplicationInput = {
    loanApplicationDetails,
    applicantCreditHistory,
    currentMarketConditions,
  };

  try {
    const result = await assessLoanApplication(input);
    return { data: result, error: null, loading: false };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error, loading: false };
  }
}
