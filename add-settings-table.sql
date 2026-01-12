-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for key lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public settings are viewable by everyone" 
ON public.settings FOR SELECT 
USING (is_public = true);

CREATE POLICY "Authenticated users can manage settings" 
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description, is_public) VALUES
    ('selected_pdf_id', '', 'ID of the currently selected/published PDF', false),
    ('app_name', 'PDF Embedder', 'Application name', true),
    ('max_file_size', '52428800', 'Maximum file upload size in bytes (50MB)', true),
    ('enable_public_uploads', 'true', 'Allow public users to upload PDFs', true),
    ('enable_download', 'true', 'Allow PDF downloads', true),
    ('default_embed_width', '100%', 'Default width for PDF embeds', true),
    ('default_embed_height', '600px', 'Default height for PDF embeds', true)
ON CONFLICT (key) DO NOTHING;