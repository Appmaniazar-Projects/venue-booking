-- Enhanced RLS Policies for Complete Booking Lifecycle Control
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "operators_create" ON bookings;
DROP POLICY IF EXISTS "operators_view" ON bookings;
DROP POLICY IF EXISTS "admin_all" ON bookings;

-- Operators can insert bookings (only their own, status = 'pending')
CREATE POLICY "operators_create" ON bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND status = 'pending'
);

-- Operators can view their own bookings
CREATE POLICY "operators_view" ON bookings
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Operators can update their own bookings (only to cancel)
CREATE POLICY "operators_cancel" ON bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by 
  AND status IN ('pending', 'confirmed')
)
WITH CHECK (
  auth.uid() = created_by 
  AND status = 'cancelled'
);

-- Admins have full access to all bookings
CREATE POLICY "admin_all" ON bookings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Database constraint: Only one confirmed booking per venue+time
CREATE UNIQUE INDEX bookings_venue_date_time_confirmed 
ON bookings (venue_id, date, start_time, end_time)
WHERE status = 'confirmed';
