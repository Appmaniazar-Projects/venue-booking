-- Create Missing Operator Profile
-- Run this in your Supabase SQL Editor

-- First, get the operator user ID from auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'oparator@test.com';

-- Then create the operator profile (replace OPERATOR_USER_ID_HERE with the actual ID from above)
INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES
  ('7833e1ad-057e-48b5-84b3-6c4468251384', 'oparator@test.com', 'operator', NOW(), NOW());

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'oparator@test.com';
