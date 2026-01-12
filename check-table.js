const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  // First check what columns exist
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error fetching from pdfs table:', error.message);
  } else {
    console.log('Sample row from pdfs table:', data);
    if (data && data.length > 0) {
      console.log('Available columns:', Object.keys(data[0]));
    }
  }
}

checkTable();
