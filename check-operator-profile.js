// Check Operator Profile in Database
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkOperatorProfile() {
  try {
    console.log('=== CHECKING OPERATOR PROFILE IN DATABASE ===\n')
    
    // Test 1: Login as admin to check profiles
    console.log('1. Logging in as admin to check database...')
    const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (adminError) {
      console.error('❌ Admin login failed:', adminError.message)
      return
    }
    
    console.log('✅ Admin login successful!')
    
    // Test 2: Check profiles table
    console.log('\n2. Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('❌ Profiles fetch error:', profilesError.message)
      return
    }
    
    console.log(`✅ Found ${profiles?.length || 0} profiles:`)
    profiles?.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.email} -> ${profile.role} (ID: ${profile.id})`)
    })
    
    // Test 3: Look for operator profile specifically
    console.log('\n3. Looking for operator profile...')
    const operatorProfile = profiles?.find(p => p.email === "oparator@test.com")
    
    if (operatorProfile) {
      console.log('✅ Operator profile found:')
      console.log(`   Email: ${operatorProfile.email}`)
      console.log(`   Role: ${operatorProfile.role}`)
      console.log(`   ID: ${operatorProfile.id}`)
      console.log(`   Created: ${operatorProfile.created_at}`)
    } else {
      console.log('❌ Operator profile NOT found!')
      console.log('   This explains why role detection falls back to user_metadata')
      console.log('   Need to create operator profile in profiles table')
    }
    
    // Test 4: Try logging in as operator again
    if (operatorProfile) {
      console.log('\n4. Testing operator login with profile in database...')
      await supabase.auth.signOut()
      
      const { data: opAuth, error: opError } = await supabase.auth.signInWithPassword({
        email: "oparator@test.com",
        password: "Test1234"
      })
      
      if (opError) {
        console.error('❌ Operator login failed:', opError.message)
      } else {
        console.log('✅ Operator login successful with profile!')
        console.log('   User ID:', opAuth.user?.id)
        console.log('   This should now work correctly')
      }
    }
    
    console.log('\n=== RECOMMENDATIONS ===')
    console.log('1. Create operator profile in profiles table if missing')
    console.log('2. Run create-users.sql script to set up profiles')
    console.log('3. Verify RLS policies allow operators to access venues')
    console.log('4. Check browser console for JavaScript errors during navigation')
    
    console.log('\n=== CHECK COMPLETE ===')
    
  } catch (error) {
    console.error('Check failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

checkOperatorProfile()
