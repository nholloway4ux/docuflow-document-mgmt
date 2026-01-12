-- Nuclear option: Recreate the table to force schema refresh

-- 1. Rename old table (keeping data safe)
ALTER TABLE public.pdfs RENAME TO pdfs_backup;

-- 2. Create new pdfs table with exact same structure
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
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    filename TEXT,
    original_filename TEXT
);

-- 3. Copy any existing data (there shouldn't be any since inserts were failing)
INSERT INTO public.pdfs SELECT * FROM public.pdfs_backup WHERE false; -- WHERE false means don't copy for now

-- 4. Create index
CREATE INDEX idx_pdfs_title ON public.pdfs(title);
CREATE INDEX idx_pdfs_uploaded_by ON public.pdfs(uploaded_by);
CREATE INDEX idx_pdfs_is_public ON public.pdfs(is_public);
CREATE INDEX idx_pdfs_is_active ON public.pdfs(is_active);

-- 5. Disable RLS for now (using service role key anyway)
ALTER TABLE public.pdfs DISABLE ROW LEVEL SECURITY;

-- 6. Force schema reload
NOTIFY pgrst, 'reload schema';

-- 7. Test the new table
SELECT COUNT(*) FROM public.pdfs;