import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    nodeEnv: process.env.NODE_ENV,
    stripeEnvVars: Object.keys(process.env).filter(key => key.startsWith('STRIPE_'))
  });
} 