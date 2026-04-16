// Test with WORKING credentials (fixed typo)
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testWorkingCancel() {
  try {
    console.log('🔥 Testing with WORKING credentials (fixed typo)...')
    
    // Login with working admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Admin login successful!')
    console.log('User ID:', authData.user.id)
    
    // Test 1: Create a booking
    console.log('\n📅 Creating test booking...')
    const testBooking = {
      id: `test${Date.now()}`,
      venue_id: "v1",
      title: "Cancel Test Booking",
      description: "Testing cancellation with working setup",
      date: "2024-12-25",
      start_time: "14:00",
      end_time: "16:00",
      expected_attendance: 50,
      organizer: "Test Admin",
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
      console.log('❌ Failed to create booking:', createError.message)
      return
    }
    
    console.log('✅ Test booking created:', createdBooking.id)
    
    // Test 2: Cancel the booking
    console.log('\n🗑️  Testing cancellation...')
    
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
    } else if (!cancelResult || cancelResult.length === 0) {
      console.log('❌ Silent RLS failure - no rows updated')
    } else {
      console.log('✅ Cancel successful!')
      console.log('Updated booking:', cancelResult[0])
    }
    
    // Test 3: Verify the change
    console.log('\n🔍 Verifying the change...')
    const { data: verifyBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', createdBooking.id)
      .single()
      
    if (verifyBooking) {
      console.log('✅ Verified booking status:', verifyBooking.status)
      console.log('Cancelled at:', verifyBooking.cancelled_at)
    } else {
      console.log('❌ Could not verify booking')
    }
    
    // Test 4: Try operator login with correct credentials
    console.log('\n🔑 Testing operator login (fixed typo)...')
    await supabase.auth.signOut()
    
    const { data: opAuth, error: opError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",  // Fixed: was "oparator@test.com"
      password: "Test1234"
    })
    
    if (opError) {
      console.log('❌ Operator login failed:', opError.message)
    } else {
      console.log('✅ Operator login successful!')
      console.log('Operator User ID:', opAuth.user.id)
    }
    
    console.log('\n🎯 Test Complete!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testWorkingCancel()
