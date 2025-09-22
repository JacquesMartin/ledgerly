export type OutstandingLoan = {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
  amount: number;
  dueDate: string;
};

export const outstandingLoans: OutstandingLoan[] = [
  {
    id: '1',
    name: 'Sarah Miller',
    avatarUrl: 'https://picsum.photos/seed/101/100/100',
    avatarHint: 'woman portrait',
    amount: 1500,
    dueDate: '2024-08-15',
  },
  {
    id: '2',
    name: 'Michael Brown',
    avatarUrl: 'https://picsum.photos/seed/102/100/100',
    avatarHint: 'man portrait',
    amount: 800,
    dueDate: '2024-08-20',
  },
  {
    id: '3',
    name: 'Jessica Williams',
    avatarUrl: 'https://picsum.photos/seed/103/100/100',
    avatarHint: 'woman smiling',
    amount: 3200,
    dueDate: '2024-09-01',
  },
];

export type Creditor = {
  id: string;
  name: string;
  email: string;
  status: 'approved' | 'pending';
};

export const creditors: Creditor[] = [
  { id: '1', name: 'Global Finance Inc.', email: 'contact@globalfinance.com', status: 'approved' },
  { id: '2', name: 'Local Lenders LLC', email: 'support@locallenders.com', status: 'approved' },
  { id: '3', name: 'Jane Doe', email: 'jane.doe@email.com', status: 'approved' },
];

export type LoanRequest = {
  id: string;
  applicant: {
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  amount: number;
  termMonths: number;
  purpose: string;
  creditHistory: string;
  marketConditions: string;
  date: string;
};

export const loanRequests: LoanRequest[] = [
  {
    id: 'req1',
    applicant: {
      name: 'David Jones',
      avatarUrl: 'https://picsum.photos/seed/104/100/100',
      avatarHint: 'man glasses',
    },
    amount: 5000,
    termMonths: 36,
    purpose: 'Home renovation',
    creditHistory:
      'David Jones has a FICO score of 720. He has a 5-year credit history with on-time payments for a car loan and two credit cards. No delinquencies or defaults. Credit utilization is at 30%.',
    marketConditions:
      'Current prime interest rate is 5.5%. The market for home improvement loans is competitive, with average rates between 6% and 9% for applicants with good credit.',
    date: '2024-08-01',
  },
  {
    id: 'req2',
    applicant: {
      name: 'Emily Davis',
      avatarUrl: 'https://picsum.photos/seed/105/100/100',
      avatarHint: 'woman blonde',
    },
    amount: 10000,
    termMonths: 60,
    purpose: 'Small business startup capital',
    creditHistory:
      'Emily Davis has a FICO score of 650. She has a 3-year credit history, with a few late payments on a credit card 2 years ago. She has a student loan that is in good standing. Credit utilization is at 60%.',
    marketConditions:
      'The small business loan market is currently tight. Interest rates are slightly elevated due to economic uncertainty. Lenders are requiring higher credit scores and more collateral than usual.',
    date: '2024-07-28',
  },
];
