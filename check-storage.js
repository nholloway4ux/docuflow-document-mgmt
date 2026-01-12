const { createClient } = require('@supabase/supabase-js');

const newUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const newServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(newUrl, newServiceKey);

async function checkAndCreateBucket() {
  console.log('Checking storage buckets...\n');
  
  // List existing buckets
  const { data: buckets, error: listError } = await supabase
    .storage
    .listBuckets();
  
  if (listError) {
    console.log('Error listing buckets:', listError);
    return;
  }
  
  console.log('Existing buckets:', buckets.map(b => b.name));
  
  // Check if 'pdfs' bucket exists
  const pdfsBucket = buckets.find(b => b.name === 'pdfs');
  
  if (!pdfsBucket) {
    console.log('\n❌ PDFs bucket does not exist. Creating it...');
    
    const { data, error } = await supabase
      .storage
      .createBucket('pdfs', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 52428800 // 50MB
      });
    
    if (error) {
      console.log('Error creating bucket:', error);
    } else {
      console.log('✅ Created pdfs bucket successfully!');
    }
  } else {
    console.log('✅ PDFs bucket already exists');
    
    // Update bucket to ensure it's public
    const { data, error } = await supabase
      .storage
      .updateBucket('pdfs', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 52428800
      });
    
    if (error) {
      console.log('Error updating bucket:', error);
    } else {
      console.log('✅ Updated pdfs bucket settings');
    }
  }
}

checkAndCreateBucket();