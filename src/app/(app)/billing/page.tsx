
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/use-subscription';
import { subscriptionPlans } from '@/lib/subscriptions';
import { CheckCircle, Loader2, Zap } from 'lucide-react';

export default function BillingPage() {
    const { subscription, loading } = useSubscription();

    if (loading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const handleSubscription = (planId: string) => {
        // In a real application, this would redirect to a Stripe Checkout session
        alert(`Redirecting to checkout for plan: ${planId}`);
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Subscription</h1>
                <p className="text-muted-foreground">
                    You are currently on the <span className="font-semibold text-primary">{subscription.plan}</span> plan.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.values(subscriptionPlans).map(plan => (
                    <Card key={plan.name} className={subscription.plan === plan.name ? 'border-primary' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                                {plan.name === 'Pro' && <Zap className="h-6 w-6 text-accent"/>}
                                {plan.name} Plan
                            </CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-4xl font-bold">{plan.price}</div>
                             <ul className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {subscription.plan === plan.name ? (
                                <Button disabled className="w-full">Current Plan</Button>
                            ) : (
                                <Button onClick={() => handleSubscription(plan.name)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    {plan.name === 'Pro' ? 'Upgrade to Pro' : 'Switch to Free'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
