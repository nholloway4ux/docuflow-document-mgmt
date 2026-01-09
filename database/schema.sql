-- PDF Embedder Database Schema
-- Run this script in your Supabase SQL editor to create the necessary tables

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create pdfs table
CREATE TABLE IF NOT EXISTS pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    embed_code TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdfs_is_active ON pdfs(is_active);
CREATE INDEX IF NOT EXISTS idx_pdfs_is_public ON pdfs(is_public);
CREATE INDEX IF NOT EXISTS idx_pdfs_uploaded_by ON pdfs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_pdfs_created_at ON pdfs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdfs_updated_at ON pdfs;
CREATE TRIGGER update_pdfs_updated_at 
    BEFORE UPDATE ON pdfs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, description, is_public) VALUES
('app_name', 'PDF Embedder', 'Application name', true),
('max_file_size', '10485760', 'Maximum file size in bytes (10MB)', false),
('allowed_file_types', 'pdf', 'Comma-separated list of allowed file extensions', false),
('enable_public_uploads', 'false', 'Allow public users to upload files', false),
('enable_download', 'true', 'Allow PDF downloads', true),
('default_embed_width', '100%', 'Default embed width', true),
('default_embed_height', '600px', 'Default embed height', true)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- PDFs policies
CREATE POLICY "Anyone can view active public PDFs" ON pdfs
    FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Authenticated users can view their own PDFs" ON pdfs
    FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can view all PDFs" ON pdfs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Authenticated users can upload PDFs" ON pdfs
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own PDFs" ON pdfs
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update any PDF" ON pdfs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Settings policies
CREATE POLICY "Anyone can view public settings" ON settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all settings" ON settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can modify settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create storage bucket for PDFs (run this in Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- Create storage policy for PDFs
-- CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'pdfs' AND 
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Users can view their own PDFs" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'pdfs' AND 
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Public PDFs are viewable" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'pdfs' AND
--         EXISTS (
--             SELECT 1 FROM pdfs 
--             WHERE file_path = name AND is_public = true AND is_active = true
--         )
--     );