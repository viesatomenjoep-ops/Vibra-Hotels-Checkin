import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-04-22.dahlia',
  appInfo: {
    name: 'Viesa Multi-Tenant SaaS',
    version: '1.0.0'
  }
});
