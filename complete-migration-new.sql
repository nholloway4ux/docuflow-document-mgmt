-- COMPLETE MIGRATION: Drop everything and recreate from scratch
-- Run this in the NEW Supabase instance

-- 1. Drop existing broken tables
DROP TABLE IF EXISTS public.pdfs CASCADE;
DROP TABLE IF EXISTS public.pdfs_backup CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. Create PDFs table EXACTLY as it exists in the old instance
CREATE TABLE public.pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,  -- Required field
    file_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    title TEXT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    storage_url TEXT,
    embed_code TEXT,
    uploaded_by TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    filename TEXT,
    original_filename TEXT
);

-- 3. Create indexes for PDFs
CREATE INDEX idx_pdfs_title ON public.pdfs(title);
CREATE INDEX idx_pdfs_is_active ON public.pdfs(is_active);
CREATE INDEX idx_pdfs_is_public ON public.pdfs(is_public);
CREATE INDEX idx_pdfs_uploaded_by ON public.pdfs(uploaded_by);
CREATE INDEX idx_pdfs_created_at ON public.pdfs(created_at DESC);

-- 4. Create Settings table EXACTLY as it exists in the old instance
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create index for settings
CREATE INDEX idx_settings_key ON public.settings(key);

-- 6. Insert the default settings that exist in the old instance
INSERT INTO public.settings (key, value, description, is_public) VALUES
    ('selected_pdf_id', '', 'Currently selected PDF ID', false),
    ('app_name', 'PDF Embedder', 'Application name', true),
    ('max_file_size', '52428800', 'Maximum file size in bytes', true),
    ('allow_downloads', 'true', 'Allow PDF downloads', true),
    ('embed_width', '100%', 'Default embed width', true),
    ('embed_height', '600px', 'Default embed height', true),
    ('allowed_origins', '*', 'Allowed origins for embedding', true),
    ('viewer_settings', '{}', 'PDF viewer settings', true),
    ('enable_public_uploads', 'true', 'Allow public uploads', true);

-- 7. Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdfs_updated_at BEFORE UPDATE ON public.pdfs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Disable RLS for now (we're using service role key)
ALTER TABLE public.pdfs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- 9. Grant permissions
GRANT ALL ON public.pdfs TO postgres, service_role;
GRANT ALL ON public.settings TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- 10. Force schema reload
NOTIFY pgrst, 'reload schema';

-- 11. Verify tables were created
SELECT 'PDFs table created with columns:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pdfs' 
ORDER BY ordinal_position;

SELECT 'Settings table created with rows:' as status;
SELECT key, value FROM public.settings ORDER BY key;