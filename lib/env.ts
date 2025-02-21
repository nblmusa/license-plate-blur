// Environment variable validation
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} must be set in environment variables`);
  }
  return value;
};

export const env = {
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  STRIPE_BASIC_PRICE_ID: getEnvVar('STRIPE_BASIC_PRICE_ID'),
  STRIPE_PRO_PRICE_ID: getEnvVar('STRIPE_PRO_PRICE_ID'),
  STRIPE_ENTERPRISE_PRICE_ID: getEnvVar('STRIPE_ENTERPRISE_PRICE_ID'),
} as const;