-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id UUID,
  p_plates_detected INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (
    user_id,
    images_processed,
    detected_plates,
    last_upload_time
  )
  VALUES (
    p_user_id,
    1,
    p_plates_detected,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    images_processed = user_stats.images_processed + 1,
    detected_plates = user_stats.detected_plates + p_plates_detected,
    last_upload_time = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$; 