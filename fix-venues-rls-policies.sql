-- Fix Venues RLS Policies for Operator Read-Only Access
-- Run this in your Supabase SQL Editor

-- Drop all existing venue policies
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Admins can manage venues" ON venues;
DROP POLICY IF EXISTS "Authenticated users can view venues" ON venues;
DROP POLICY IF EXISTS "Authenticated users can insert venues" ON venues;
DROP POLICY IF EXISTS "Authenticated users can update venues" ON venues;
DROP POLICY IF EXISTS "Authenticated users can delete venues" ON venues;
DROP POLICY IF EXISTS "Anyone can insert venues" ON venues;
DROP POLICY IF EXISTS "Anyone can update venues" ON venues;
DROP POLICY IF EXISTS "Anyone can delete venues" ON venues;
DROP POLICY IF EXISTS "Enable all access for testing" ON venues;

-- Create proper RLS policies for venues
-- 1. All authenticated users can view venues (operators and admins)
CREATE POLICY "Authenticated users can view venues" ON venues 
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Only admins can insert venues
CREATE POLICY "Admins can insert venues" ON venues 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 3. Only admins can update venues
CREATE POLICY "Admins can update venues" ON venues 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Only admins can delete venues
CREATE POLICY "Admins can delete venues" ON venues 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Verify policies were created correctly
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
WHERE tablename = 'venues'
ORDER BY policyname;
