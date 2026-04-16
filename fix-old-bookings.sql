-- One-Time Cleanup for Old Bookings
-- Run this in your Supabase SQL Editor

-- First, let's see what we're working with
SELECT 
  id, 
  title, 
  status, 
  created_by,
  'CURRENT_STATE' as analysis
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- Fix missing created_by if needed (replace with actual user IDs)
-- You may need to update these values based on your actual users

-- Get actual user IDs first
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email IN ('admin@test.com', 'operator@test.com');

-- Then fix bookings with missing created_by
-- Replace 'USER_ID_HERE' with actual UUIDs from the query above
UPDATE bookings 
SET created_by = 'USER_ID_HERE' 
WHERE created_by IS NULL;

-- Normalize any null statuses
UPDATE bookings 
SET status = 'pending' 
WHERE status IS NULL;

-- Add cancelled_at column if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Verify the fixes
SELECT 
  id, 
  title, 
  status, 
  created_by,
  cancelled_at,
  'FIXED_STATE' as analysis
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
