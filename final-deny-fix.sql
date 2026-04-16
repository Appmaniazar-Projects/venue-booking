-- Final fix for deny status issue
-- Run this in your Supabase SQL Editor

-- First, check if there are any constraints preventing status updates
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'bookings';

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookings';

-- Test manual deny to see if it works
UPDATE bookings 
SET status = 'denied',
    denial_reason = 'Manual test fix'
WHERE id = 'test-booking-id-here'
AND status = 'pending';

-- Verify the update
SELECT id, status, denial_reason 
FROM bookings 
WHERE id = 'test-booking-id-here';
