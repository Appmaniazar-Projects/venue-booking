-- Create service role and grant permissions
-- Run this in your Supabase SQL Editor

-- Create service role for migrations
CREATE ROLE IF NOT EXISTS service_role WITH NOLOGIN;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO service_role;

-- Set row security to bypass for service role
ALTER ROLE service_role SET bypassrls = true;
