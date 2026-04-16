// Test the bulletproof cancel booking implementation
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testBulletproofCancel() {
  try {
    console.log('🔥 Testing Bulletproof Cancel Implementation...')
    
    // Step 1: Login as operator
    console.log('\n📝 Logging in as operator...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",
      password: "Test@1234"
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Operator login successful!')
    console.log('User ID:', authData.user.id)
    
    // Step 2: Create a test booking
    console.log('\n📅 Creating test booking...')
    const testBooking = {
      id: `test${Date.now()}`,
      venue_id: "v1",
      title: "Test Cancel Booking",
      description: "Testing cancellation functionality",
      date: "2024-12-25",
      start_time: "14:00",
      end_time: "16:00",
      expected_attendance: 50,
      organizer: "Test Operator",
      risk_level: "low",
      amplified_noise: false,
      liquor_license: false,
      status: "pending",
      created_by: authData.user.id,
      created_at: new Date().toISOString()
    }
    
    const { data: createdBooking, error: createError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
      .single()
      
    if (createError) {
      console.log('❌ Failed to create test booking:', createError.message)
      return
    }
    
    console.log('✅ Test booking created:', createdBooking.id)
    
    // Step 3: Test the cancel function with debugging
    console.log('\n🗑️  Testing cancel with debugging...')
    
    // Simulate the cancelBooking function logic
    console.log("CANCEL DEBUG: Attempting to cancel booking", { 
      bookingId: createdBooking.id, 
      userId: authData.user.id 
    })

    const { data: cancelResult, error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', createdBooking.id)
      .eq('created_by', authData.user.id)
      .select()

    console.log("CANCEL RESULT:", { data: cancelResult, error: cancelError })

    if (cancelError) {
      console.log('❌ Cancel error:', cancelError.message)
      console.log('🔍 This is likely an RLS policy issue')
    } else if (!cancelResult || cancelResult.length === 0) {
      console.log('❌ Silent RLS failure - no rows updated')
      console.log('🔍 This means the RLS policy blocked the update')
    } else {
      console.log('✅ Cancel successful!')
      console.log('Updated booking:', cancelResult[0])
    }
    
    // Step 4: Check RLS policies
    console.log('\n🔍 Checking current RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'bookings')
      
    if (policyError) {
      console.log('❌ Could not check policies:', policyError.message)
    } else {
      console.log('Current booking policies:')
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
    // Step 5: Test admin cancel
    console.log('\n👑 Testing admin cancel...')
    
    // Login as admin
    const { data: adminAuth, error: adminLoginError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (adminLoginError) {
      console.error('❌ Admin login failed:', adminLoginError.message)
      return
    }
    
    console.log('✅ Admin login successful!')
    
    // Create another test booking for admin to cancel
    const adminTestBooking = {
      ...testBooking,
      id: `admin${Date.now()}`,
      created_by: adminAuth.user.id
    }
    
    const { data: adminBooking, error: adminCreateError } = await supabase
      .from('bookings')
      .insert(adminTestBooking)
      .select()
      .single()
      
    if (adminCreateError) {
      console.log('❌ Failed to create admin test booking:', adminCreateError.message)
      return
    }
    
    console.log('✅ Admin test booking created:', adminBooking.id)
    
    // Admin cancel test
    const { data: adminCancelResult, error: adminCancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', adminBooking.id)
      .select()

    console.log("ADMIN CANCEL RESULT:", { data: adminCancelResult, error: adminCancelError })
    
    if (adminCancelError) {
      console.log('❌ Admin cancel error:', adminCancelError.message)
    } else if (!adminCancelResult || adminCancelResult.length === 0) {
      console.log('❌ Admin cancel also failed - RLS issue')
    } else {
      console.log('✅ Admin cancel successful!')
    }
    
    console.log('\n🎯 Bulletproof Cancel Test Complete!')
    console.log('💡 Check the console logs above to identify the exact issue')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBulletproofCancel()
