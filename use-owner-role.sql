-- Use database owner role to bypass RLS
-- Run this in your Supabase SQL Editor

-- Grant owner permissions to your authenticated users
GRANT postgres TO authenticated;

-- This allows authenticated users to bypass RLS
-- Alternative approach if service role doesn't work
