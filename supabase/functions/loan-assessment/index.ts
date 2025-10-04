import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoanAssessmentRequest {
  loanApplicationDetails: string;
  applicantCreditHistory: string;
  currentMarketConditions: string;
}

interface LoanAssessmentResponse {
  recommendation: 'approve' | 'modify' | 'reject';
  modifiedTerms?: string;
  justification: string;
  requireCoMaker?: boolean;
  requireDocuments?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { loanApplicationDetails, applicantCreditHistory, currentMarketConditions }: LoanAssessmentRequest = await req.json()

    // AI Assessment Logic (simplified version)
    const assessment = await assessLoanApplication({
      loanApplicationDetails,
      applicantCreditHistory,
      currentMarketConditions
    })

    return new Response(
      JSON.stringify(assessment),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function assessLoanApplication(input: LoanAssessmentRequest): Promise<LoanAssessmentResponse> {
  // This is a simplified AI assessment
  // In a real implementation, you would integrate with OpenAI, Anthropic, or another AI service
  
  const { loanApplicationDetails, applicantCreditHistory, currentMarketConditions } = input;
  
  // Simple scoring system based on credit history
  let score = 0;
  
  // Analyze credit history keywords
  const positiveKeywords = ['good', 'excellent', 'outstanding', 'perfect', 'clean'];
  const negativeKeywords = ['poor', 'bad', 'default', 'late', 'missed', 'delinquent'];
  
  const creditHistoryLower = applicantCreditHistory.toLowerCase();
  
  positiveKeywords.forEach(keyword => {
    if (creditHistoryLower.includes(keyword)) score += 2;
  });
  
  negativeKeywords.forEach(keyword => {
    if (creditHistoryLower.includes(keyword)) score -= 2;
  });
  
  // Determine recommendation based on score
  let recommendation: 'approve' | 'modify' | 'reject';
  let justification: string;
  let modifiedTerms: string | undefined;
  let requireCoMaker: boolean | undefined;
  let requireDocuments: boolean | undefined;
  
  if (score >= 4) {
    recommendation = 'approve';
    justification = 'Strong credit history and favorable conditions support loan approval.';
  } else if (score >= 0) {
    recommendation = 'modify';
    justification = 'Moderate credit history suggests modified terms would be appropriate.';
    modifiedTerms = 'Consider reducing loan amount by 10-15% or increasing interest rate by 0.5-1%.';
    requireCoMaker = true;
    requireDocuments = true;
  } else {
    recommendation = 'reject';
    justification = 'Credit history and risk factors do not support loan approval at this time.';
  }
  
  return {
    recommendation,
    modifiedTerms,
    justification,
    requireCoMaker,
    requireDocuments
  };
}

