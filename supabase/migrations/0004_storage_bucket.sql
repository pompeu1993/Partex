-- Create a storage bucket for site assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Policy to allow admins to upload assets
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy to allow admins to update assets
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy to allow admins to delete assets
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
