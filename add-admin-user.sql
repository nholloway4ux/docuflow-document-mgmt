-- ================================================
-- Add Admin User to Supabase Auth
-- ================================================
-- Email: esherer@greaterprovidence.org
-- Password: gpbc!_2026*
-- ================================================

-- Note: Since we removed custom user tables and rely entirely on Supabase Auth,
-- we need to create the user through Supabase's auth.users table

-- IMPORTANT: Run this in the Supabase SQL Editor with service_role permissions

-- Step 1: Create the user in auth.users
-- This creates a user with email/password authentication
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'esherer@greaterprovidence.org',
    crypt('gpbc!_2026*', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    ''
);

-- Step 2: Create an identity for the user (required for email auth)
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    id,
    id::text,
    'email',
    jsonb_build_object(
        'sub', id::text,
        'email', email,
        'email_verified', true,
        'provider', 'email'
    ),
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'esherer@greaterprovidence.org';

-- ================================================
-- Verification Query
-- ================================================
-- Run this to verify the user was created:
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    role
FROM auth.users 
WHERE email = 'esherer@greaterprovidence.org';

-- ================================================
-- IMPORTANT NOTES:
-- ================================================
-- 1. This user will have full access to upload and manage PDFs
-- 2. They can log in immediately at https://pdfadminwordpress.vercel.app/login
-- 3. Since we don't have role-based access control, all authenticated users have the same permissions
-- ================================================