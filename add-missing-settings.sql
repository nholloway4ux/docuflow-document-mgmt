-- Add the settings that the application expects

-- First, add is_public column if missing
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Insert the settings the app needs (keeping existing ones)
INSERT INTO public.settings (key, value, description, is_public) VALUES
    ('app_name', 'PDF Embedder', 'Application name', true),
    ('enable_public_uploads', 'true', 'Allow public users to upload PDFs', true),
    ('enable_download', 'true', 'Allow PDF downloads', true),
    ('default_embed_width', '100%', 'Default width for PDF embeds', true),
    ('default_embed_height', '600px', 'Default height for PDF embeds', true),
    ('selected_pdf_id', '', 'ID of the currently selected/published PDF', false)
ON CONFLICT (key) DO NOTHING;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Show all settings
SELECT * FROM public.settings ORDER BY key;