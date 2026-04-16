-- Update existing RLS policies to be more permissive
-- Run this in your Supabase SQL Editor

-- Drop and recreate policies with proper permissions
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

-- Create simple permissive policies for testing
CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (true);
CREATE POLICY "Anyone can insert venues" ON venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update venues" ON venues FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete venues" ON venues FOR DELETE USING (true);

CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bookings" ON bookings FOR DELETE USING (true);

CREATE POLICY "Trigger logs are viewable by everyone" ON trigger_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert trigger logs" ON trigger_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Override logs are viewable by everyone" ON override_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert override logs" ON override_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Parking areas are viewable by everyone" ON parking_areas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert parking areas" ON parking_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update parking areas" ON parking_areas FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete parking areas" ON parking_areas FOR DELETE USING (true);

CREATE POLICY "Roads are viewable by everyone" ON roads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert roads" ON roads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update roads" ON roads FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete roads" ON roads FOR DELETE USING (true);
