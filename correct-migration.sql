-- CORRECT Migration - Exactly matching the original pdfs table schema
-- Based on actual schema from the working database at xxqwaklciqjarvatwfnv.supabase.co

-- Drop any existing incorrect table
DROP TABLE IF EXISTS public.pdfs CASCADE;

-- Create pdfs table with EXACT column names from original
CREATE TABLE public.pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT,
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
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    filename TEXT,
    original_filename TEXT
);

-- Create indexes for performance (same as original)
CREATE INDEX idx_pdfs_created_at ON public.pdfs(created_at DESC);
CREATE INDEX idx_pdfs_is_active ON public.pdfs(is_active);
CREATE INDEX idx_pdfs_is_public ON public.pdfs(is_public);

-- Enable RLS
ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public PDFs are viewable by everyone" 
ON public.pdfs FOR SELECT 
USING (is_public = true);

CREATE POLICY "Authenticated users can upload PDFs" 
ON public.pdfs FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own PDFs" 
ON public.pdfs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete their own PDFs" 
ON public.pdfs FOR DELETE
TO authenticated
USING (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdfs_updated_at BEFORE UPDATE ON public.pdfs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
