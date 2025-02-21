import Stripe from 'stripe';
// import './envConfig';

const getStripeSecretKey = (): string => {
  const key = process.env.STRIPE_SECRET_KEY || 'sk_test_51QuXNUPcpoWva5n6tTzHN2tXqSOps4rMowU12p2Lf8uJewDUhBxWPI5IrGvqeniVZDVI5kf9zIhjhasiD9zZmE0v00abjkaE2y';
  if (!key || typeof key !== 'string') {
    throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
  }
  return key;
};

export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2023-10-16',
});

export const PLANS = {
  BASIC: {
    name: 'Basic',
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'prod_RoAVV0tul1pDY0',
    features: [
      '100 images per month',
      'Basic API access',
      'Email support',
      'Standard processing',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'prod_RoAVV0tul1pDY0',
    features: [
      '1000 images per month',
      'Advanced API access',
      'Priority support',
      'Faster processing',
      'Bulk processing',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99.99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'prod_RoAVV0tul1pDY0',
    features: [
      'Unlimited images',
      'Full API access',
      'Dedicated support',
      'Custom integration',
      'Fastest processing',
      'Team management',
    ],
  },
};