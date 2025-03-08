-- Add new columns to subscriptions table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_id') THEN
        ALTER TABLE subscriptions ADD COLUMN plan_id TEXT NOT NULL DEFAULT 'basic';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'trial_end') THEN
        ALTER TABLE subscriptions ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'quantity') THEN
        ALTER TABLE subscriptions ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add new columns to invoices table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE invoices ADD COLUMN stripe_subscription_id TEXT REFERENCES subscriptions(stripe_subscription_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'currency') THEN
        ALTER TABLE invoices ADD COLUMN currency TEXT NOT NULL DEFAULT 'usd';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'hosted_invoice_url') THEN
        ALTER TABLE invoices ADD COLUMN hosted_invoice_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'period_start') THEN
        ALTER TABLE invoices ADD COLUMN period_start TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'period_end') THEN
        ALTER TABLE invoices ADD COLUMN period_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add status constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'subscriptions' AND constraint_name = 'valid_status'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT valid_status 
        CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'invoices' AND constraint_name = 'valid_status'
    ) THEN
        ALTER TABLE invoices ADD CONSTRAINT valid_status 
        CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void'));
    END IF;
END $$;

-- Create new indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_plan_id') THEN
        CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_status') THEN
        CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_stripe_subscription_id') THEN
        CREATE INDEX idx_invoices_stripe_subscription_id ON invoices(stripe_subscription_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_status') THEN
        CREATE INDEX idx_invoices_status ON invoices(status);
    END IF;
END $$; 