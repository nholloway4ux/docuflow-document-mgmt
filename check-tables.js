const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking what Supabase can see...\n');
  
  // Skip RPC for now
  
  // Try to select from pdfs with raw SQL
  console.log('\nTrying direct query...');
  const { data: direct, error: directError } = await supabase
    .from('pdfs')
    .select()
    .limit(0); // Just get structure, no data
  
  if (directError) {
    console.log('Direct query error:', directError.message);
  } else {
    console.log('Direct query succeeded - table is accessible');
  }
  
  // List all accessible tables
  console.log('\nTrying to access settings table...');
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(2);
  
  if (settingsError) {
    console.log('Settings error:', settingsError.message);
  } else {
    console.log('Settings accessible, found', settings?.length || 0, 'rows');
    if (settings && settings.length > 0) {
      console.log('Settings columns:', Object.keys(settings[0]));
    }
  }
}

checkTables();