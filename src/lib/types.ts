

export type Creditor = {
  id: string;
  name: string;
  email: string;
  status: 'approved' | 'pending';
};

export type LoanApplication = {
  id:string;
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
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  date: string; // ISO string
  dueDate: string; // ISO string
  creditHistory: string;
  marketConditions: string;
  modifiedTerms?: string;
  requiresCoMaker?: boolean;
  requiresDocuments?: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  contactNumber?: string;
  address?: string;
}

export type UserPreferences = {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
};

export type Notification = {
  id: string;
  recipientId: string;
  loanId: string;
  type: 'NEW_LOAN_REQUEST' | 'LOAN_MODIFIED' | 'LOAN_ACCEPTED';
  message: string;
  isRead: boolean;
  createdAt: string; // ISO string
};

export type Payment = {
  id: string;
  loanId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  date: string; // ISO string
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet';
  reference?: string;
  notes?: string;
  createdAt: string; // ISO string
};
