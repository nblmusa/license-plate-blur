import Stripe from 'stripe';
// import './envConfig';

// Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
  limits: {
    imagesPerMonth: number;
    maxFileSize: number;
    apiAccess: boolean;
    teamMembers: number;
  };
  metadata: {
    recommended?: boolean;
    enterprise?: boolean;
  };
}

export interface PlanWithUsage extends Plan {
  usage: {
    imagesProcessed: number;
    periodStart: Date;
    periodEnd: Date;
    daysLeft: number;
  };
}

// Stripe configuration
const STRIPE_CONFIG = {
  currency: 'usd',
  taxRates: process.env.STRIPE_TAX_RATES?.split(',') || [],
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled`,
  trialDays: 14,
};

if (!process.env.STRIPE_SECRET_KEY) {
  // throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Plan definitions
export const PLANS: Record<string, Plan> = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out our service',
    price: 0,
    priceId: 'free',
    features: [
      '5 images per month',
      'Basic processing',
      'Watermarked output',
      'Community support',
    ],
    limits: {
      imagesPerMonth: 5,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      apiAccess: false,
      teamMembers: 1,
    },
    metadata: {},
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    description: 'Great for individuals and small projects',
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      '100 images per month',
      'No watermarks',
      'Basic API access',
      'Email support',
      'Standard processing',
    ],
    limits: {
      imagesPerMonth: 100,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      apiAccess: true,
      teamMembers: 1,
    },
    metadata: {},
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'Perfect for professionals and growing businesses',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      '1000 images per month',
      'Advanced API access',
      'Priority support',
      'Faster processing',
      'Bulk processing',
      'Custom watermarks',
    ],
    limits: {
      imagesPerMonth: 1000,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      apiAccess: true,
      teamMembers: 5,
    },
    metadata: {
      recommended: true,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 99.99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    features: [
      'Unlimited images',
      'Full API access',
      'Dedicated support',
      'Custom integration',
      'Fastest processing',
      'Team management',
      'Custom contracts',
    ],
    limits: {
      imagesPerMonth: Infinity,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      apiAccess: true,
      teamMembers: Infinity,
    },
    metadata: {
      enterprise: true,
    },
  },
};

// Helper functions
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl?: string
): Promise<string> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: returnUrl ?? STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          plan: Object.keys(PLANS).find(key => PLANS[key].priceId === priceId) ?? '',
        },
      },
    });

    if (!session?.url) throw new Error('Failed to create checkout session');
    return session.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (!session?.url) throw new Error('Failed to create portal session');
    return session.url;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

export function getPlanById(planId: string): Plan | undefined {
  return PLANS[planId.toUpperCase()];
}

export function isValidPlan(planId: string): boolean {
  return planId.toUpperCase() in PLANS;
}

export function getNextPlan(currentPlanId: string): Plan | undefined {
  const planIds = Object.keys(PLANS);
  const currentIndex = planIds.indexOf(currentPlanId.toUpperCase());
  if (currentIndex === -1 || currentIndex === planIds.length - 1) return undefined;
  return PLANS[planIds[currentIndex + 1]];
}

export function calculateUsage(
  imagesProcessed: number,
  planId: string
): number {
  const plan = getPlanById(planId);
  if (!plan || plan.limits.imagesPerMonth === Infinity) return 0;
  return (imagesProcessed / plan.limits.imagesPerMonth) * 100;
}