-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to upload receipts
CREATE POLICY "Allow anyone to upload receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
);

-- Create a policy that allows anyone to view receipts
CREATE POLICY "Allow anyone to view receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts'
);

-- Set up automatic deletion of files after 7 days
-- This requires setting up a cron job or scheduled function

-- Create a function to clean up expired files
CREATE OR REPLACE FUNCTION storage.delete_expired_receipts()
RETURNS void AS $$
DECLARE
  expired_files RECORD;
  seven_days_ago TIMESTAMP;
BEGIN
  -- Calculate timestamp for 7 days ago
  seven_days_ago := NOW() - INTERVAL '7 days';
  
  -- Find files older than 7 days
  FOR expired_files IN
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'receipts' 
    AND created_at < seven_days_ago
  LOOP
    -- Delete each expired file
    PERFORM storage.delete_object('receipts', expired_files.name);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run the cleanup function daily
-- Note: This requires the pg_cron extension to be enabled
-- If pg_cron is not available, you'll need to set up an external scheduler

-- Check if pg_cron extension exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Schedule the job to run daily at 3 AM
    PERFORM cron.schedule(
      'delete-expired-receipts',
      '0 3 * * *',
      'SELECT storage.delete_expired_receipts()'
    );
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Please set up an external scheduler to run the storage.delete_expired_receipts() function daily.';
  END IF;
END
$$;

-- Instructions for setting up an external scheduler if pg_cron is not available:
-- 1. Create a scheduled function in Supabase Edge Functions
-- 2. Set up a daily cron job using a service like GitHub Actions, Vercel Cron, or AWS Lambda
-- 3. The function should call the cleanupExpiredReceiptsStorage() action 