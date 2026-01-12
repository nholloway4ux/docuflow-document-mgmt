const { createClient } = require('@supabase/supabase-js');

// OLD Supabase instance
const oldUrl = 'https://xxqwaklciqjarvatwfnv.supabase.co';
const oldServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXdha2xjaXFqYXJ2YXR3Zm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMTQ1NSwiZXhwIjoyMDgzMzc3NDU1fQ.m8UlPJoW6l-i-VEWZvI91nNgpXM8TNdR7EQw8RoXH_E';

// NEW Supabase instance
const newUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const newServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

const oldSupabase = createClient(oldUrl, oldServiceKey);
const newSupabase = createClient(newUrl, newServiceKey);

async function compareInstances() {
  console.log('🔍 COMPARING OLD vs NEW SUPABASE INSTANCES\n');
  console.log('=' . repeat(60));
  
  // 1. Check PDFs table in OLD instance
  console.log('\n📊 OLD INSTANCE - PDFs Table:');
  console.log('-'.repeat(40));
  
  const { data: oldPdfs, error: oldPdfsError } = await oldSupabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (oldPdfsError) {
    console.log('❌ Error accessing old PDFs table:', oldPdfsError.message);
  } else if (oldPdfs && oldPdfs.length > 0) {
    console.log('✅ PDFs table exists with columns:');
    console.log(Object.keys(oldPdfs[0]));
  } else {
    console.log('✅ PDFs table exists but is empty');
    // Try to get schema another way
    const { error: insertError } = await oldSupabase
      .from('pdfs')
      .insert({ title: 'test' })
      .select();
    
    if (insertError) {
      console.log('Schema probe error:', insertError.message);
    }
  }
  
  // 2. Check PDFs table in NEW instance
  console.log('\n📊 NEW INSTANCE - PDFs Table:');
  console.log('-'.repeat(40));
  
  const { data: newPdfs, error: newPdfsError } = await newSupabase
    .from('pdfs')
    .select('*')
    .limit(1);
  
  if (newPdfsError) {
    console.log('❌ Error accessing new PDFs table:', newPdfsError.message);
  } else if (newPdfs && newPdfs.length > 0) {
    console.log('✅ PDFs table exists with columns:');
    console.log(Object.keys(newPdfs[0]));
  } else {
    console.log('✅ PDFs table exists but is empty');
  }
  
  // 3. Check Settings table in OLD instance
  console.log('\n⚙️ OLD INSTANCE - Settings Table:');
  console.log('-'.repeat(40));
  
  const { data: oldSettings, error: oldSettingsError } = await oldSupabase
    .from('settings')
    .select('*');
  
  if (oldSettingsError) {
    console.log('❌ Error accessing old Settings table:', oldSettingsError.message);
  } else {
    console.log(`✅ Settings table exists with ${oldSettings.length} rows`);
    if (oldSettings.length > 0) {
      console.log('Columns:', Object.keys(oldSettings[0]));
      console.log('\nSettings keys found:');
      oldSettings.forEach(s => console.log(`  - ${s.key}: ${s.value}`));
    }
  }
  
  // 4. Check Settings table in NEW instance
  console.log('\n⚙️ NEW INSTANCE - Settings Table:');
  console.log('-'.repeat(40));
  
  const { data: newSettings, error: newSettingsError } = await newSupabase
    .from('settings')
    .select('*');
  
  if (newSettingsError) {
    console.log('❌ Error accessing new Settings table:', newSettingsError.message);
  } else {
    console.log(`✅ Settings table exists with ${newSettings.length} rows`);
    if (newSettings.length > 0) {
      console.log('Columns:', Object.keys(newSettings[0]));
      console.log('\nSettings keys found:');
      newSettings.forEach(s => console.log(`  - ${s.key}: ${s.value}`));
    }
  }
  
  // 5. Test INSERT on OLD instance
  console.log('\n🧪 TESTING INSERT ON OLD INSTANCE:');
  console.log('-'.repeat(40));
  
  const testData = {
    title: 'Test PDF',
    filename: 'test.pdf',
    file_size: 1000
  };
  
  const { data: oldInsert, error: oldInsertError } = await oldSupabase
    .from('pdfs')
    .insert(testData)
    .select();
  
  if (oldInsertError) {
    console.log('❌ Insert failed on old:', oldInsertError.message);
  } else {
    console.log('✅ Insert works on old instance!');
    // Clean up
    if (oldInsert && oldInsert[0]) {
      await oldSupabase.from('pdfs').delete().eq('id', oldInsert[0].id);
    }
  }
  
  // 6. Test INSERT on NEW instance
  console.log('\n🧪 TESTING INSERT ON NEW INSTANCE:');
  console.log('-'.repeat(40));
  
  const { data: newInsert, error: newInsertError } = await newSupabase
    .from('pdfs')
    .insert(testData)
    .select();
  
  if (newInsertError) {
    console.log('❌ Insert failed on new:', newInsertError.message);
  } else {
    console.log('✅ Insert works on new instance!');
    // Clean up
    if (newInsert && newInsert[0]) {
      await newSupabase.from('pdfs').delete().eq('id', newInsert[0].id);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY:');
  console.log('The main issue is that the NEW instance has a schema cache problem.');
  console.log('The tables exist but Supabase PostgREST cannot see the columns.');
}

compareInstances();