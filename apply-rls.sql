-- Apply RLS Policies - CRITICAL FIX
-- Run this in your Supabase SQL Editor

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "operators_create" ON bookings;
DROP POLICY IF EXISTS "operators_view" ON bookings;
DROP POLICY IF EXISTS "operators_cancel_own_bookings" ON bookings;
DROP POLICY IF EXISTS "admin_all" ON bookings;

-- Create policies that will work
CREATE POLICY "operators_create" ON bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND status = 'pending'
);

CREATE POLICY "operators_view" ON bookings
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "operators_cancel_own_bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
)
WITH CHECK (
  auth.uid() = created_by
  AND status = 'cancelled'
);

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

-- Verify policies are applied
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
