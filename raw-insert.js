const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function testRawInsert() {
  console.log('Testing with forced schema reload...\n');
  
  // Force a new client instance
  const freshSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' },
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } }
  });
  
  // Try the most basic insert possible
  console.log('Attempting basic insert...');
  const { data, error } = await freshSupabase
    .from('pdfs')
    .insert({
      title: 'Test'
    })
    .select();
  
  if (error) {
    console.error('❌ Basic insert failed:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('✅ Insert successful!', data);
  }
}

testRawInsert();