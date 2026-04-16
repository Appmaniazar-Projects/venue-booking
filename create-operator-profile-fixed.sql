-- Create Missing Operator Profile (Fixed Schema)
-- Run this in your Supabase SQL Editor

-- First, check if profiles table exists and get its structure
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Create operator profile without updated_at column (since it may not exist)
INSERT INTO profiles (id, email, role, created_at) VALUES
  ('7833e1ad-057e-48b5-84b3-6c4468251384', 'oparator@test.com', 'operator', NOW());

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'oparator@test.com';
