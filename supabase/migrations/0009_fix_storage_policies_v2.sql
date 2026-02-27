-- Fix Storage Policies definitively
-- First, drop all policies related to this bucket to start fresh
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Ensure the bucket is public just in case, though for sensitive docs we prefer private.
-- However, RLS on storage is tricky. Let's simplify for now to ensure it works.
-- We will keep it private but fix the RLS logic.

-- 1. INSERT Policy
-- Allow any authenticated user to upload a file if the path starts with their user ID
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. SELECT Policy
-- Allow users to see their own files AND Admins to see everything
CREATE POLICY "Allow access to own files or admin"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text -- User owns the file
    OR
    EXISTS ( -- OR User is an admin
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- 3. UPDATE/DELETE Policy (Optional but good for cleanup)
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
