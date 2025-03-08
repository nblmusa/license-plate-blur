-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
DROP POLICY IF EXISTS "Service role can manage all settings" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_settings;

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

-- Make sure RLS is enabled
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies with more permissive access
CREATE POLICY "Enable read access for own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM user_settings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 