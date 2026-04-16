-- Safe Cleanup of Existing Duplicate Bookings
-- Run this in your Supabase SQL Editor

-- 1. First, identify duplicates (same venue, date, time, title)
WITH duplicate_groups AS (
  SELECT 
    venue_id,
    date,
    start_time,
    end_time,
    title,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at DESC) as booking_ids,
    ARRAY_AGG(created_at ORDER BY created_at DESC) as created_times
  FROM bookings
  GROUP BY venue_id, date, start_time, end_time, title
  HAVING COUNT(*) > 1
),
duplicates_to_delete AS (
  SELECT 
    unnest(booking_ids[2:array_length(booking_ids, 1)]) as id_to_delete,
    booking_ids[1] as id_to_keep
  FROM duplicate_groups
)

-- 2. Create a backup of duplicates before deletion (optional but recommended)
CREATE TABLE IF NOT EXISTS bookings_duplicate_backup AS
SELECT b.*, 'duplicate_cleanup' as cleanup_reason
FROM bookings b
JOIN duplicates_to_delete d ON b.id = d.id_to_delete;

-- 3. Show what will be deleted (review this before running the delete)
SELECT 
  d.id_to_delete,
  d.id_to_keep,
  b.title,
  b.venue_id,
  b.date,
  b.start_time,
  b.end_time,
  b.status,
  b.created_at
FROM duplicates_to_delete d
JOIN bookings b ON d.id_to_delete = b.id
ORDER BY b.venue_id, b.date, b.start_time;

-- 4. Delete the duplicates (keep the newest one based on created_at)
-- UNCOMMENT THE BELOW LINE AFTER REVIEWING THE ABOVE RESULTS
/*
DELETE FROM bookings
WHERE id IN (SELECT id_to_delete FROM duplicates_to_delete);
*/

-- 5. Verify cleanup results
SELECT 
  venue_id,
  date,
  start_time,
  end_time,
  title,
  COUNT(*) as remaining_count
FROM bookings
GROUP BY venue_id, date, start_time, end_time, title
HAVING COUNT(*) > 1
ORDER BY venue_id, date, start_time;
