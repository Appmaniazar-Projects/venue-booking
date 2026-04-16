-- COMPLETE DATABASE CONSTRAINTS FOR BOOKING FIXES
-- Run this entire script in your Supabase SQL Editor

-- 1. Add missing cancelled_at column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- 2. Fix status constraint to include "denied"
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'override', 'denied'));

-- 3. Add unique constraint for pending bookings (prevent duplicates)
ALTER TABLE bookings 
ADD CONSTRAINT bookings_one_pending_per_venue_time 
UNIQUE (venue_id, date, start_time, end_time)
WHERE status = 'pending';

-- 4. Ensure unique constraint for confirmed bookings
DROP INDEX IF EXISTS bookings_one_confirmed_per_venue_time;
CREATE UNIQUE INDEX bookings_one_confirmed_per_venue_time 
ON bookings (venue_id, date, start_time, end_time)
WHERE status = 'confirmed';

-- 5. Add constraint to ensure required fields are present
ALTER TABLE bookings 
ADD CONSTRAINT bookings_required_fields 
CHECK (
  title IS NOT NULL AND 
  venue_id IS NOT NULL AND
  date IS NOT NULL AND
  start_time IS NOT NULL AND
  end_time IS NOT NULL AND
  organizer IS NOT NULL AND
  expected_attendance > 0
);

-- 6. Verify all constraints were added
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  pg_get_constraintdef(tc.oid) as definition
FROM information_schema.table_constraints tc
JOIN pg_constraint pgc ON tc.constraint_name = pgc.conname
WHERE tc.table_name = 'bookings'
AND tc.constraint_type IN ('UNIQUE', 'CHECK')
ORDER BY tc.constraint_name;
