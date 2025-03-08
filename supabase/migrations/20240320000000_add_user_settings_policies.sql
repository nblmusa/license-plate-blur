-- Drop table if exists
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
  DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_settings;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_settings;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_settings;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_settings;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create or replace the user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  temp_2fa_secret TEXT,
  email_notifications JSONB DEFAULT '{
    "newLogin": true,
    "usageAlerts": true,
    "newsletter": false,
    "marketing": false
  }'::jsonb,
  auto_processing JSONB DEFAULT '{
    "autoMask": true,
    "autoDownload": false,
    "saveOriginal": true,
    "highQuality": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'email_notifications') THEN
        ALTER TABLE user_settings ADD COLUMN email_notifications JSONB DEFAULT '{
            "newLogin": true,
            "usageAlerts": true,
            "newsletter": false,
            "marketing": false
        }'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'auto_processing') THEN
        ALTER TABLE user_settings ADD COLUMN auto_processing JSONB DEFAULT '{
            "autoMask": true,
            "autoDownload": false,
            "saveOriginal": true,
            "highQuality": true
        }'::jsonb;
    END IF;
END $$;

-- Ensure constraints exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_settings_user_id_fkey') THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_settings_user_id_key') THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key 
        UNIQUE (user_id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for authenticated users"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for authenticated users"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 