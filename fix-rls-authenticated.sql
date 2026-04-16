-- Fix RLS policies for authenticated users
-- Run this in your Supabase SQL Editor

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

-- Create new policies for authenticated users
CREATE POLICY "Authenticated users can view venues" ON venues FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert venues" ON venues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update venues" ON venues FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete venues" ON venues FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert bookings" ON bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update bookings" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete bookings" ON bookings FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view trigger logs" ON trigger_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert trigger logs" ON trigger_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view override logs" ON override_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert override logs" ON override_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view parking areas" ON parking_areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert parking areas" ON parking_areas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update parking areas" ON parking_areas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete parking areas" ON parking_areas FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view roads" ON roads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert roads" ON roads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update roads" ON roads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete roads" ON roads FOR DELETE USING (auth.role() = 'authenticated');
