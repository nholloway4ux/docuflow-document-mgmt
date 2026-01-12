const { createClient } = require('@supabase/supabase-js');

// New Supabase instance
const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPDFs() {
  console.log('Checking PDFs in database and storage...\n');
  
  // Check PDFs table
  const { data: pdfs, error: pdfsError } = await supabase
    .from('pdfs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (pdfsError) {
    console.error('Error querying PDFs:', pdfsError);
    return;
  }
  
  console.log(`Found ${pdfs.length} PDFs in database:\n`);
  
  for (const pdf of pdfs) {
    console.log(`ID: ${pdf.id}`);
    console.log(`  Title: ${pdf.title}`);
    console.log(`  Original name: ${pdf.original_name}`);
    console.log(`  File path: ${pdf.file_path}`);
    console.log(`  Storage URL: ${pdf.storage_url}`);
    console.log(`  Created: ${pdf.created_at}`);
    console.log('---');
  }
  
  // Check storage bucket
  console.log('\nChecking storage bucket...');
  const { data: files, error: storageError } = await supabase
    .storage
    .from('pdfs')
    .list('pdfs', {
      limit: 100,
      offset: 0
    });
  
  if (storageError) {
    console.error('Error listing storage files:', storageError);
    return;
  }
  
  console.log(`\nFound ${files?.length || 0} files in storage bucket:`);
  if (files && files.length > 0) {
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 0} bytes)`);
    });
  }
}

checkPDFs();