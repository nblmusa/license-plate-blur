-- Add unique constraint to stripe_customer_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'subscriptions' 
        AND constraint_name = 'subscriptions_stripe_customer_id_key'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id);
    END IF;
END $$;

-- Drop and recreate policies for invoices to allow all operations for service role
DROP POLICY IF EXISTS "Service role can manage all invoices" ON invoices;

CREATE POLICY "Service role can manage all invoices"
  ON invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add policies for insert and update if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can insert subscriptions'
    ) THEN
        CREATE POLICY "Service role can insert subscriptions"
          ON subscriptions
          FOR INSERT
          TO service_role
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can update subscriptions'
    ) THEN
        CREATE POLICY "Service role can update subscriptions"
          ON subscriptions
          FOR UPDATE
          TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can delete subscriptions'
    ) THEN
        CREATE POLICY "Service role can delete subscriptions"
          ON subscriptions
          FOR DELETE
          TO service_role
          USING (true);
    END IF;
END $$; 