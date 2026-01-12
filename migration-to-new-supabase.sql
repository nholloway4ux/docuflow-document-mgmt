-- ================================================
-- PDF Admin System - Complete Supabase Migration Script
-- ================================================
-- This script creates all necessary tables, storage buckets, and policies
-- for the PDF Admin WordPress application
-- 
-- New Supabase Project URL: https://sirvbbqnufgpklyodmqq.supabase.co
-- ================================================

-- ================================================
-- 1. USERS TABLE
-- ================================================
-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);

-- ================================================
-- 2. PDFS TABLE
-- ================================================
-- Drop existing table if it exists
DROP TABLE IF EXISTS public.pdfs CASCADE;

-- Create pdfs table
CREATE TABLE public.pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT,
    storage_url TEXT,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT DEFAULT 'application/pdf',
    is_selected BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_pdfs_is_selected ON public.pdfs(is_selected);
CREATE INDEX idx_pdfs_created_at ON public.pdfs(created_at DESC);
CREATE INDEX idx_pdfs_uploaded_by ON public.pdfs(uploaded_by);
CREATE INDEX idx_pdfs_tags ON public.pdfs USING GIN(tags);

-- ================================================
-- 3. SETTINGS TABLE
-- ================================================
-- Drop existing table if it exists
DROP TABLE IF EXISTS public.settings CASCADE;

-- Create settings table
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
    ('site_name', '"PDF Admin System"', 'Name of the site'),
    ('max_file_size', '10485760', 'Maximum file size in bytes (10MB default)'),
    ('allowed_mime_types', '["application/pdf"]', 'Allowed MIME types for uploads'),
    ('enable_public_access', 'true', 'Enable public access to selected PDFs')
ON CONFLICT (key) DO NOTHING;

-- ================================================
-- 4. AUDIT_LOG TABLE (Optional - for tracking changes)
-- ================================================
DROP TABLE IF EXISTS public.audit_log CASCADE;

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 6. CREATE RLS POLICIES
-- ================================================

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_id);

-- PDFs table policies
CREATE POLICY "Anyone can view PDFs" ON public.pdfs
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert PDFs" ON public.pdfs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own PDFs" ON public.pdfs
    FOR UPDATE USING (
        uploaded_by IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own PDFs" ON public.pdfs
    FOR DELETE USING (
        uploaded_by IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- Settings table policies (admin only)
CREATE POLICY "Anyone can view settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() AND role = 'admin'
        )
    );

-- Audit log policies
CREATE POLICY "Users can view their own audit logs" ON public.audit_log
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- ================================================
-- 7. CREATE FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at BEFORE UPDATE ON public.pdfs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one PDF is selected at a time
CREATE OR REPLACE FUNCTION ensure_single_selected_pdf()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_selected = true THEN
        UPDATE public.pdfs SET is_selected = false 
        WHERE id != NEW.id AND is_selected = true;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_selected_pdf_trigger
    BEFORE INSERT OR UPDATE ON public.pdfs
    FOR EACH ROW
    WHEN (NEW.is_selected = true)
    EXECUTE FUNCTION ensure_single_selected_pdf();

-- Function to automatically create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (email, auth_id, role)
    VALUES (
        NEW.email,
        NEW.id,
        CASE 
            WHEN NEW.email = 'shawnj@mobileapphero.com' THEN 'admin'
            ELSE 'viewer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating user records
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- 8. CREATE STORAGE BUCKET
-- ================================================
-- Note: This needs to be run through Supabase Dashboard or using Supabase JS Admin Client
-- as SQL doesn't directly support storage bucket creation

-- Run this in Supabase SQL Editor to insert storage bucket record:
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'pdfs',
    'pdfs',
    true,
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf']::text[]
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 9. STORAGE POLICIES
-- ================================================
-- Anyone can view PDFs
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'pdfs');

-- Authenticated users can upload PDFs
CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'pdfs' AND
        auth.uid() IS NOT NULL
    );

-- Users can update their own PDFs
CREATE POLICY "Users can update own PDFs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own PDFs
CREATE POLICY "Users can delete own PDFs" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'pdfs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ================================================
-- 10. CREATE INITIAL ADMIN USER (Optional)
-- ================================================
-- Note: First create the user through Supabase Auth, then update their role
-- UPDATE public.users SET role = 'admin' WHERE email = 'shawnj@mobileapphero.com';

-- ================================================
-- 11. GRANT PERMISSIONS
-- ================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ================================================
-- MIGRATION COMPLETE!
-- ================================================
-- After running this script:
-- 1. Create a user account for digitalsleep@gmail.com through the application
-- 2. The user will automatically be set as admin based on the trigger
-- 3. Update your .env files with the new Supabase URL and keys
-- 4. Test the application thoroughly
-- ================================================