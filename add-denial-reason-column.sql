-- Add the missing denial_reason column to the bookings table
-- Run this in your Supabase SQL Editor

-- Add the denial_reason column
ALTER TABLE bookings 
ADD COLUMN denial_reason TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'denial_reason';
