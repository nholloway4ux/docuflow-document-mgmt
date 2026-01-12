-- COMPLETE FIX for both settings and pdfs tables

-- 1. Fix settings table - add missing is_public column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Update existing settings rows with proper is_public values
UPDATE public.settings SET is_public = true 
WHERE key IN ('app_name', 'max_file_size', 'enable_public_uploads', 'enable_download', 'default_embed_width', 'default_embed_height');

UPDATE public.settings SET is_public = false 
WHERE key = 'selected_pdf_id';

-- 3. First check what columns the settings table actually has
SELECT column_name FROM information_schema.columns WHERE table_name = 'settings';

-- 4. Insert default settings (adjusting for actual column structure)
-- If value column is JSON type, we need to format differently
INSERT INTO public.settings (key, value, description, is_public) 
SELECT * FROM (VALUES
    ('selected_pdf_id', '""'::text, 'ID of the currently selected/published PDF', false),
    ('app_name', '"PDF Embedder"'::text, 'Application name', true),
    ('max_file_size', '"52428800"'::text, 'Maximum file upload size in bytes (50MB)', true),
    ('enable_public_uploads', '"true"'::text, 'Allow public users to upload PDFs', true),
    ('enable_download', '"true"'::text, 'Allow PDF downloads', true),
    ('default_embed_width', '"100%"'::text, 'Default width for PDF embeds', true),
    ('default_embed_height', '"600px"'::text, 'Default height for PDF embeds', true)
) AS t(key, value, description, is_public)
WHERE NOT EXISTS (SELECT 1 FROM public.settings WHERE settings.key = t.key);

-- 4. Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- 5. Verify the tables
SELECT 'Settings table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

SELECT 'PDFs table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pdfs' 
ORDER BY ordinal_position;