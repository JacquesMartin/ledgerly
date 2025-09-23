
export type Creditor = {
  id: string;
  name: string;
  email: string;
  status: 'approved' | 'pending';
};

export type LoanApplication = {
  id: string;
  applicant: {
    uid: string;
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  creditorId: string;
  amount: number;
  termMonths: number;
  interestRate: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string; // ISO string
  dueDate: string; // ISO string
  creditHistory: string;
  marketConditions: string;
};

export type UserPreferences = {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
};
