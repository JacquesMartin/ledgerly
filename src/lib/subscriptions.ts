
export type SubscriptionPlan = {
    name: string;
    description: string;
    price: string;
    priceId: string; // From Stripe
    features: string[];
};

export type Subscription = {
    plan: 'Free' | 'Pro';
    // other subscription data from Stripe like status, current_period_end, etc.
};

export const FREE_PLAN: Subscription = {
    plan: 'Free',
};

export const PRO_PLAN_ID = 'pro_plan'; // Example ID

export const subscriptionPlans: Record<string, SubscriptionPlan> = {
    free_plan: {
        name: 'Free',
        description: 'For individuals starting out.',
        price: '$0/mo',
        priceId: '',
        features: [
            'Manage up to 3 active loans',
            'Basic dashboard analytics',
            'Standard support'
        ]
    },
    [PRO_PLAN_ID]: {
        name: 'Pro',
        description: 'For power users and professionals.',
        price: '$10/mo',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
        features: [
            'Unlimited active loans',
            'AI-Powered Loan Assessment',
            'Advanced dashboard analytics',
            'Priority email support'
        ]
    }
}
