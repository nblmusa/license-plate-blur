-- Create bucket for processed images
INSERT INTO storage.buckets (id, name, public)
VALUES ('processed-images', 'processed-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'processed-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public access to processed images
CREATE POLICY "Public can view processed images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'processed-images');

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'processed-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 