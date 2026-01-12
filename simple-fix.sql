-- Simple fix: Just add the is_public column and reload cache

-- 1. Add is_public column if it doesn't exist
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2. Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- 3. Check the result
SELECT * FROM public.settings LIMIT 5;