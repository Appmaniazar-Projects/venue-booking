// Test Venues Access for Operators
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testVenuesAccess() {
  try {
    console.log('=== TESTING VENUES ACCESS ===\n')
    
    // Test 1: Try to access venues without authentication
    console.log('1. Testing unauthenticated venues access...')
    const { data: unauthVenues, error: unauthError } = await supabase
      .from('venues')
      .select('*')
      .limit(3)
      
    if (unauthError) {
      console.log('Unauthenticated access error:', unauthError.message)
    } else {
      console.log(`Unauthenticated: Found ${unauthVenues?.length || 0} venues`)
    }
    
    // Test 2: Login as operator
    console.log('\n2. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",
      password: "Operator1234"
    })
    
    if (authError) {
      console.log('Operator login failed:', authError.message)
      console.log('Trying admin login for comparison...')
      
      const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
        email: "admin@test.com", 
        password: "Admin1234"
      })
      
      if (adminError) {
        console.error('Admin login also failed:', adminError.message)
        return
      }
      
      console.log('Admin login successful')
    } else {
      console.log('Operator login successful!')
    }
    
    // Test 3: Try to access venues as authenticated user
    console.log('\n3. Testing authenticated venues access...')
    const { data: authVenues, error: authVenuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(5)
      
    if (authVenuesError) {
      console.log('Authenticated venues error:', authVenuesError.message)
      console.log('This indicates RLS policy is blocking access')
    } else {
      console.log(`Authenticated: Found ${authVenues?.length || 0} venues`)
      authVenues?.forEach(v => {
        console.log(`   - ${v.name} (${v.type})`)
      })
    }
    
    // Test 4: Check current RLS policies
    console.log('\n4. Checking current RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename, permissive, roles')
      .eq('tablename', 'venues')
      
    if (policiesError) {
      console.log('Cannot check policies (need admin access):', policiesError.message)
    } else {
      console.log('Current venue policies:')
      policies?.forEach(p => {
        console.log(`   - ${p.policyname} (${p.permissive ? 'permissive' : 'restrictive'})`)
      })
    }
    
    console.log('\n=== RECOMMENDATIONS ===')
    console.log('If venues are not showing for operators:')
    console.log('1. Run: fix-venues-rls-policies.sql in Supabase')
    console.log('2. Ensure RLS allows authenticated users to SELECT from venues')
    console.log('3. Verify UI restrictions are working correctly')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testVenuesAccess()
