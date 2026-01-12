const { createClient } = require('@supabase/supabase-js');

// Original Supabase instance
const supabaseUrl = 'https://xxqwaklciqjarvatwfnv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXdha2xjaXFqYXJ2YXR3Zm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDE0NTUsImV4cCI6MjA4MzM3NzQ1NX0.FLwurR6LOvm83scKuV0wWy6HuZR49j47_e0CCAvLE-o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getSchema() {
  console.log('Connecting to ORIGINAL Supabase instance...');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  // Try to get a sample row to see the actual columns
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error.message);
    
    // Try to at least insert a test row to see what columns are expected
    console.log('\nTrying to understand schema through error messages...');
    const { error: insertError } = await supabase
      .from('pdfs')
      .insert([{ test: 'test' }]);
    
    if (insertError) {
      console.log('Insert error (this helps identify columns):', insertError.message);
    }
  } else {
    console.log('Successfully connected to pdfs table!');
    console.log('Sample row (showing actual column names):');
    
    if (data && data.length > 0) {
      console.log('\nActual columns in the table:');
      console.log(Object.keys(data[0]));
      console.log('\nSample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('Table exists but is empty');
      
      // Try to get table info through Supabase's information schema
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'pdfs' })
        .catch(() => ({ data: null, error: 'RPC not available' }));
      
      if (schemaData) {
        console.log('\nTable schema:', schemaData);
      }
    }
  }
}

getSchema();
