-- Add Comprehensive Database Constraints for Booking Duplication Prevention
-- Run this in your Supabase SQL Editor

-- 1. Add unique constraint for pending bookings (prevent duplicates)
-- Only one pending booking per venue + date + time combination
ALTER TABLE bookings 
ADD CONSTRAINT bookings_one_pending_per_venue_time 
UNIQUE (venue_id, date, start_time, end_time)
WHERE status = 'pending';

-- 2. Add unique constraint for confirmed bookings (already exists but let's ensure)
-- Only one confirmed booking per venue + date + time combination
DROP INDEX IF EXISTS bookings_one_confirmed_per_venue_time;
CREATE UNIQUE INDEX bookings_one_confirmed_per_venue_time 
ON bookings (venue_id, date, start_time, end_time)
WHERE status = 'confirmed';

-- 3. Add check constraint to prevent invalid status transitions
ALTER TABLE bookings 
ADD CONSTRAINT bookings_valid_status_transitions 
CHECK (
  -- Allow any initial status
  OR (status = 'pending')
  OR (status = 'confirmed')
  OR (status = 'cancelled')
  OR (status = 'denied')
  OR (status = 'override')
);

-- 4. Add constraint to ensure required fields are present
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

-- 5. Verify constraints were added
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
