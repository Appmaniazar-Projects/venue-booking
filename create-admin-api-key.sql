-- Create admin API key with full permissions
-- Run this in your Supabase SQL Editor

-- Create a new API key that can bypass RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api_admin') THEN
    RAISE NOTICE 'Role api_admin already exists';
  ELSE
    CREATE ROLE api_admin WITH NOLOGIN;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO api_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO api_admin;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO api_admin;
    GRANT USAGE ON SCHEMA public TO api_admin;
    ALTER ROLE api_admin SET bypassrls = true;
    RAISE NOTICE 'Role api_admin created successfully';
  END IF;
END;
$$;
