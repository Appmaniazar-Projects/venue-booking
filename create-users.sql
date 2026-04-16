-- Create missing user profiles - CRITICAL FIX
-- Run this in your Supabase SQL Editor

-- First, get the actual user IDs from auth.users
SELECT id, email, created_at FROM auth.users;

-- Then insert into profiles table (replace with actual UUIDs from above)
INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES
  ('7833e1ad-057e-48b5-84b3-6c4468251384', 'operator@test.com', 'operator', NOW(), NOW()),
  ('ADMIN_USER_ID_HERE', 'admin@test.com', 'admin', NOW(), NOW());

-- Verify the insert
SELECT * FROM profiles;
