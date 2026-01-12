// Script to create admin user using Supabase Admin API
// Run with: node create-admin-user.js

const { createClient } = require('@supabase/supabase-js');

// Configuration - using the new Supabase instance
const supabaseUrl = 'https://sirvbbqnufgpklyodmqq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcnZiYnFudWZncGtseW9kbXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgyMjk3OCwiZXhwIjoyMDgzMzk4OTc4fQ.6LmLnph-P4OMCRgbp5OcTZnveh1uDdQKe_ui5K2N5gE';

// User to create
const newUser = {
  email: 'esherer@greaterprovidence.org',
  password: 'gpbc!_2026*',
  email_confirm: true
};

async function createAdminUser() {
  try {
    // Create Supabase client with service role key (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Creating user:', newUser.email);

    // Create the user using admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      email_confirm: newUser.email_confirm,
      user_metadata: {
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating user:', error.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Created at:', data.user.created_at);
    console.log('\nThe user can now log in at: https://pdfadminwordpress.vercel.app/login');
    console.log('Email:', newUser.email);
    console.log('Password:', newUser.password);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminUser();