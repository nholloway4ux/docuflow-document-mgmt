-- SQL script to initialize the users table and required functions for PDF Embedder
-- Run this in your Supabase SQL editor

-- Enable RLS (Row Level Security) for better security
-- This is usually enabled by default in Supabase

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create a function to handle table creation (for the app to call)
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists(sql text DEFAULT '')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- The table creation is handled above, so just return true
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE LOG 'Error in create_users_table_if_not_exists: %', SQLERRM;
    RETURN false;
END;
$$;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
-- Policy: Users can only read their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (auth.uid() = id::text);

-- Policy: Only allow admin operations through service role
-- This allows our API routes to manage users with the service key
CREATE POLICY "Service role full access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_users_table_if_not_exists TO authenticated, anon;

-- Note: The above grants are necessary for the API routes to work
-- In production, you might want more restrictive policies