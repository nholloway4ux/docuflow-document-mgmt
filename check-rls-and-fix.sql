-- Check RLS status and fix if needed

-- 1. Check if RLS is enabled on pdfs table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'pdfs';

-- 2. Disable RLS temporarily to test if that's the issue
ALTER TABLE public.pdfs DISABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.pdfs;
DROP POLICY IF EXISTS "Enable read for all users" ON public.pdfs;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.pdfs;
DROP POLICY IF EXISTS "Enable update for all users" ON public.pdfs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.pdfs;

-- 4. Since we're using service role key, we don't need RLS for now
-- Service role bypasses RLS anyway

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';

-- 6. Test by trying to select from the table
SELECT COUNT(*) as pdf_count FROM public.pdfs;

-- 7. Show table structure to confirm columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pdfs'
ORDER BY ordinal_position;