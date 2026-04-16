-- Create operator profile with correct UUID
-- Run this in your Supabase SQL Editor

-- We need to find the operator's user ID first
SELECT id, email, created_at FROM auth.users WHERE email = 'operator@test.com';

-- Then insert with the actual UUID (replace OPERATOR_USER_ID_HERE with the real ID)
INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES
  ('OPERATOR_USER_ID_HERE', 'operator@test.com', 'operator', NOW(), NOW());

-- Verify both users exist
SELECT * FROM profiles WHERE email IN ('admin@test.com', 'operator@test.com');
