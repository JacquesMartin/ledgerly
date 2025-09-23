
'use server';

/**
 * @fileOverview A flow for handling notifications related to loan applications.
 * This flow is triggered by changes in the 'loan_applications' collection in Firestore.
 */

import { ai } from '@/ai/genkit';
import { onFlow } from '@genkit-ai/next/onflow';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LoanApplication, Notification } from '@/lib/types';
import { firebase } from 'genkit/x-firebase';

export const loanApplicationNotifier = onFlow(
  {
    name: 'loanApplicationNotifier',
    triggers: [
      firebase.onDocumentCreate('loan_applications/{loanId}'),
    ],
    inputSchema: undefined,
    outputSchema: undefined,
  },
  async (event) => {
    const loanId = event.params.loanId;
    if (!loanId) {
      console.log('No loanId found in the event');
      return;
    }

    const loanRef = doc(db, 'loan_applications', loanId);
    const loanSnap = await getDoc(loanRef);

    if (!loanSnap.exists()) {
      console.log(`Loan document with id ${loanId} does not exist.`);
      return;
    }

    const loan = loanSnap.data() as LoanApplication;
    
    // The user who needs to be notified is the creditor
    const recipientId = loan.creditorId;

    const notification: Omit<Notification, 'id'> = {
      recipientId,
      loanId: loanId,
      type: 'NEW_LOAN_REQUEST',
      message: `You have a new loan request for $${loan.amount} from ${loan.applicant.name}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Save notification to Firestore
    await setDoc(doc(db, 'notifications', `${recipientId}_${loanId}`), notification);

    console.log(`Notification created for recipient ${recipientId} for loan ${loanId}`);
    
    // Here you would typically send an FCM push notification.
    // This requires setting up FCM and managing user device tokens.
    // For this example, we are creating a notification in the database.
  }
);
