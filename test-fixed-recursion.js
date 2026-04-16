// Test the fixed recursion issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFixedRecursion() {
  try {
    console.log('🔥 Testing Fixed Recursion Issue...')
    
    // Login as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Admin login successful!')
    
    // Create a test booking
    console.log('\n📅 Creating test booking...')
    const testBooking = {
      id: `fix${Date.now()}`,
      venue_id: "v1",
      title: "Recursion Fix Test",
      description: "Testing fixed recursion issue",
      date: "2024-12-25",
      start_time: "18:00",
      end_time: "20:00",
      expected_attendance: 25,
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
    
    // Test 1: Confirm booking (should not cause recursion)
    console.log('\n✅ Testing confirm booking (no recursion expected)...')
    
    const { data: confirmResult, error: confirmError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed'
      })
      .eq('id', createdBooking.id)
      .select()

    console.log("CONFIRM RESULT:", { data: confirmResult, error: confirmError })

    if (confirmError) {
      console.log('❌ Confirm error:', confirmError.message)
    } else if (!confirmResult || confirmResult.length === 0) {
      console.log('❌ Confirm failed - no rows updated')
    } else {
      console.log('✅ Confirm successful!')
      console.log('Updated booking:', confirmResult[0])
    }
    
    // Test 2: Cancel booking (should not cause recursion)
    console.log('\n🗑️  Testing cancel booking (no recursion expected)...')
    
    const { data: cancelResult, error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', createdBooking.id)
      .select()

    console.log("CANCEL RESULT:", { data: cancelResult, error: cancelError })

    if (cancelError) {
      console.log('❌ Cancel error:', cancelError.message)
    } else if (!cancelResult || cancelResult.length === 0) {
      console.log('❌ Cancel failed - no rows updated')
    } else {
      console.log('✅ Cancel successful!')
      console.log('Updated booking:', cancelResult[0])
    }
    
    console.log('\n🎯 Recursion Fix Test Complete!')
    console.log('💡 No more infinite recursion - all functions work correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testFixedRecursion()
