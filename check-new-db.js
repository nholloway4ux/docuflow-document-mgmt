const { createClient } = require('@supabase/supabase-js');

// NEW Supabase instance
const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Checking NEW Supabase instance schema...');
  
  // Get a sample row to see columns
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('\nColumns in NEW database pdfs table:');
    console.log(Object.keys(data[0]));
    
    // Check if is_active exists
    console.log('\nis_active column exists?', 'is_active' in data[0]);
    console.log('is_public column exists?', 'is_public' in data[0]);
  } else {
    console.log('Table is empty, trying to insert test row to get column info...');
  }
  
  // Also check settings table
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);
    
  if (settingsError) {
    console.log('\nSettings table error:', settingsError.message);
  } else {
    console.log('\nSettings table exists');
  }
}

checkSchema();
