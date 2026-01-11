# 📋 Supabase Migration Guide

## Migration from Old Supabase to New Supabase Account

### New Supabase Details:
- **Project URL**: https://sirvbbqnufgpklyodmqq.supabase.co
- **Service Key**: Provided (stored in `.env.new-supabase`)

---

## 🚀 Step-by-Step Migration Process

### Step 1: Run the Migration Script

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/sirvbbqnufgpklyodmqq
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Migration Script**
   - Copy the entire contents of `migration-to-new-supabase.sql`
   - Paste it into the SQL Editor
   - Click **Run** button
   - You should see "Success" messages for each table creation

### Step 2: Get the Anon Key

1. **Navigate to API Settings**
   - Go to: https://supabase.com/dashboard/project/sirvbbqnufgpklyodmqq/settings/api
   
2. **Copy the Anon Key**
   - Find the section labeled "Project API keys"
   - Copy the **anon public** key (it's safe to expose this one)
   - Save it for the next step

### Step 3: Update Environment Variables

1. **Update `.env.local` file**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sirvbbqnufgpklyodmqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_FROM_STEP_2
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE
```

2. **Update `.env.production` file** with the same values

### Step 4: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `pdfadminwordpress`

2. **Update Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Update these variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://sirvbbqnufgpklyodmqq.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (the anon key from Step 2)
     - `SUPABASE_SERVICE_ROLE_KEY` = (the service key provided)

3. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

### Step 5: Create Initial Admin User

1. **Visit your application**
   - Go to: https://pdfadminwordpress.vercel.app/login
   
2. **Sign up with admin email**
   - Use email: `digitalsleep@gmail.com`
   - Use password: `123456789` (or your preferred password)
   - The trigger will automatically set this user as admin

### Step 6: Test the Application

1. **Test Authentication**
   - Log in with the admin account
   - Verify you can access the admin panel

2. **Test PDF Upload**
   - Upload a test PDF
   - Verify it appears in the library

3. **Test WordPress Plugin**
   - The plugin should work immediately with the new backend
   - Test the `[gpbc_bulletin]` shortcode

### Step 7: Update WordPress Plugin (if needed)

If the API URL has changed, update the plugin files:

1. **Edit** `wordpress-plugin/gpbc-pdf-bulletin-clean.php`
2. **Find** all instances of the old API URL
3. **Replace** with your new deployment URL (if different from pdfadminwordpress.vercel.app)

---

## 🔍 Verification Checklist

- [ ] Migration script ran successfully
- [ ] Storage bucket 'pdfs' was created
- [ ] Environment variables updated locally
- [ ] Vercel environment variables updated
- [ ] Application redeployed on Vercel
- [ ] Admin user created and can log in
- [ ] PDF upload works
- [ ] PDF display works
- [ ] WordPress plugin fetches PDFs correctly

---

## 🚨 Troubleshooting

### Issue: "relation 'users' does not exist"
**Solution**: Make sure to run the ENTIRE migration script, not just parts of it.

### Issue: "permission denied for schema public"
**Solution**: You're using the wrong database role. Use the service_role key for migrations.

### Issue: Can't upload PDFs
**Solution**: 
1. Check if the storage bucket was created
2. Verify the storage policies were applied
3. Check Supabase dashboard → Storage → Buckets

### Issue: Authentication not working
**Solution**:
1. Verify the anon key is correct
2. Check that auth.users trigger was created
3. Ensure email confirmations are disabled in Supabase Auth settings

### Issue: WordPress plugin not showing PDFs
**Solution**:
1. Check API endpoint URL in plugin
2. Verify CORS settings in Supabase
3. Test API directly: https://pdfadminwordpress.vercel.app/api/pdfs

---

## 📝 Important Notes

1. **Backup**: The old Supabase data is not migrated automatically. Export it first if needed.

2. **Storage URLs**: PDF URLs will change. Existing PDFs need to be re-uploaded to the new instance.

3. **User Accounts**: Users need to re-register on the new system (except the admin).

4. **API Keys**: Never commit the service_role key to public repositories after this migration.

---

## ✅ Migration Complete!

Once all steps are verified, your PDF Admin System is fully migrated to the new Supabase account!