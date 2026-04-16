-- Manual Cleanup SQL for Test Bookings
-- Run these commands directly in your Supabase SQL editor

-- Delete all test bookings by ID patterns
DELETE FROM bookings WHERE id LIKE 'test%';
DELETE FROM bookings WHERE id LIKE 'sidebar%';
DELETE FROM bookings WHERE id LIKE 'delete%';
DELETE FROM bookings WHERE id LIKE 'cancel%';
DELETE FROM bookings WHERE id LIKE 'simple%';
DELETE FROM bookings WHERE id LIKE 'dup%';
DELETE FROM bookings WHERE id LIKE 'b%' AND LENGTH(id) < 20;

-- Delete bookings with test titles
DELETE FROM bookings WHERE title ILIKE '%test%';
DELETE FROM bookings WHERE title ILIKE '%Test%';
DELETE FROM bookings WHERE title ILIKE '%Cancel Test%';
DELETE FROM bookings WHERE title ILIKE '%Simple Deny%';
DELETE FROM bookings WHERE title ILIKE '%Comprehensive Test%';

-- Delete bookings with test organizers
DELETE FROM bookings WHERE organizer ILIKE '%Test Operator%';
DELETE FROM bookings WHERE organizer ILIKE '%test operator%';

-- Verify cleanup
SELECT COUNT(*) as remaining_bookings FROM bookings;
SELECT id, title, organizer, status FROM bookings ORDER BY created_at DESC;

-- Optional: Update RLS policy to allow admin deletion
-- Uncomment and run if you want to fix the permission issue
/*
CREATE POLICY "Admin can delete any booking" ON bookings
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.uid() = created_by
);
*/
