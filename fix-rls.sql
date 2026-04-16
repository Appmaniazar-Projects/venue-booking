-- Fix RLS policies to allow initial access
-- Run this in your Supabase SQL Editor to fix permission issues

-- Temporarily disable RLS for initial setup
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE override_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE parking_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE roads DISABLE ROW LEVEL SECURITY;

-- Re-enable with more permissive policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE override_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Admins can manage venues" ON venues;
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Trigger logs are viewable by everyone" ON trigger_logs;
DROP POLICY IF EXISTS "System can create trigger logs" ON trigger_logs;
DROP POLICY IF EXISTS "Override logs are viewable by everyone" ON override_logs;
DROP POLICY IF EXISTS "Admins can create override logs" ON override_logs;
DROP POLICY IF EXISTS "Parking areas are viewable by everyone" ON parking_areas;
DROP POLICY IF EXISTS "Admins can manage parking areas" ON parking_areas;
DROP POLICY IF EXISTS "Roads are viewable by everyone" ON roads;
DROP POLICY IF EXISTS "Admins can manage roads" ON roads;

-- Create simple permissive policies for now
CREATE POLICY "Enable all access for testing" ON venues FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON bookings FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON trigger_logs FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON override_logs FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON parking_areas FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON roads FOR ALL USING (true);
