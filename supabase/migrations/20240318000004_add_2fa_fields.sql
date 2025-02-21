-- Add 2FA fields to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS temp_2fa_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_2fa_enabled 
ON public.user_settings(two_factor_enabled) 
WHERE two_factor_enabled = true; 