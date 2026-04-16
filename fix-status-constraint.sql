-- Fix the status constraint to allow "denied" status
-- Run this in your Supabase SQL Editor

-- First, check what the current constraint looks like
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass 
AND contype = 'c';

-- Drop the old constraint (it doesn't include "denied")
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Create a new constraint that includes "denied"
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'override', 'denied'));

-- Verify the new constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass 
AND contype = 'c';
