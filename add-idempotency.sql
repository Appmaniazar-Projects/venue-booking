-- Add Idempotency Key for Duplicate Prevention
-- Run this in your Supabase SQL Editor

-- Add idempotency key column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS idempotency_key UUID DEFAULT gen_random_uuid();

-- Add unique constraint
ALTER TABLE bookings 
ADD CONSTRAINT bookings_idempotency_key_unique 
UNIQUE (idempotency_key);

-- Update existing bookings to have idempotency keys
UPDATE bookings 
SET idempotency_key = gen_random_uuid() 
WHERE idempotency_key IS NULL;
