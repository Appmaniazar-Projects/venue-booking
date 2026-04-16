// Quick diagnosis of what's actually failing
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnose() {
  try {
    console.log('🔍 Quick Diagnosis of Current Issues...')
    
    // Test 1: Check what users exist
    console.log('\n👥 Checking existing users...')
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      
    if (userError) {
      console.error('❌ Failed to check users:', userError.message)
    } else {
      console.log('✅ Found users:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }
    
    // Test 2: Check existing bookings
    console.log('\n📅 Checking existing bookings...')
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, title, status, created_by')
      .limit(5)
      
    if (bookingError) {
      console.error('❌ Failed to check bookings:', bookingError.message)
    } else {
      console.log('✅ Found bookings:')
      bookings.forEach(booking => {
        console.log(`  - ${booking.title} (${booking.status}) - created_by: ${booking.created_by}`)
      })
    }
    
    // Test 3: Try login with correct credentials
    console.log('\n🔑 Testing login with existing credentials...')
    
    // Try operator@test.com first (fixed typo)
    const { data: opAuth, error: opError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",  // Fixed: was "oparator@test.com"
      password: "Test1234"
    })
    
    if (opError) {
      console.log('❌ Operator login failed:', opError.message)
    } else {
      console.log('✅ Operator login successful!')
      await supabase.auth.signOut()
    }
    
    // Try admin@test.com
    const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com", 
      password: "Admin1234"
    })
    
    if (adminError) {
      console.log('❌ Admin login failed:', adminError.message)
    } else {
      console.log('✅ Admin login successful!')
      await supabase.auth.signOut()
    }
    
    // Test 4: Check RLS policies
    console.log('\n🔍 Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'bookings')
      
    if (policyError) {
      console.log('❌ Could not check policies:', policyError.message)
    } else {
      console.log('Current RLS policies for bookings:')
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
    console.log('\n🎯 Diagnosis Complete!')
    console.log('💡 Use this info to identify the real issue')
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
  }
}

diagnose()
