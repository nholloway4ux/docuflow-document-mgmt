const { createClient } = require('@supabase/supabase-js');

// New Supabase instance
const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Checking database schema...\n');
  
  // Try a simpler query to check if settings table exists
  const { data: settingsTest, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);
  
  if (settingsError) {
    if (settingsError.message.includes('relation "public.settings" does not exist')) {
      console.log('❌ Settings table does not exist');
    } else {
      console.log('Settings table error:', settingsError.message);
    }
  } else {
    console.log('✅ Settings table exists');
    if (settingsTest && settingsTest.length > 0) {
      console.log('Columns:', Object.keys(settingsTest[0]));
    }
  }
  
  // Check PDFs table
  const { data: pdfsTest, error: pdfsError } = await supabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (pdfsError) {
    console.log('\n❌ PDFs table error:', pdfsError.message);
  } else {
    console.log('\n✅ PDFs table exists');
    if (pdfsTest && pdfsTest.length === 0) {
      // Try to get column info even if table is empty
      const { data: pdfsInsert, error: insertError } = await supabase
        .from('pdfs')
        .insert([{ title: 'test' }])
        .select();
      
      if (insertError) {
        console.log('Insert test (to check columns):', insertError.message);
        // Extract column names from error if possible
        if (insertError.message.includes('column')) {
          console.log('This might indicate required columns');
        }
      } else {
        // Delete the test row
        if (pdfsInsert && pdfsInsert[0]) {
          await supabase.from('pdfs').delete().eq('id', pdfsInsert[0].id);
          console.log('Columns:', Object.keys(pdfsInsert[0]));
        }
      }
    } else if (pdfsTest && pdfsTest.length > 0) {
      console.log('Columns:', Object.keys(pdfsTest[0]));
    }
  }
}

checkSchema();