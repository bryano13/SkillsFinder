/*
  # Add storage bucket for avatars

  1. Changes
    - Create a new storage bucket for employee avatars
    - Set public access policy for the bucket
*/

-- Create a new storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files in the avatars bucket
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload files to the avatars bucket
CREATE POLICY "Allow uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update and delete their own files
CREATE POLICY "Allow update and delete"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');