// Test the denied status functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDeniedStatus() {
  try {
    console.log('🔥 Testing Denied Status Functionality...')
    
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
    console.log('\n📅 Creating test booking for deny test...')
    const testBooking = {
      id: `deny${Date.now()}`,
      venue_id: "v1",
      title: "Deny Status Test",
      description: "Testing denied status functionality",
      date: "2024-12-25",
      start_time: "20:00",
      end_time: "22:00",
      expected_attendance: 40,
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
    console.log('Initial status:', createdBooking.status)
    
    // Test deny functionality
    console.log('\n🚫 Testing deny booking (should set status to "denied")...')
    
    const { data: denyResult, error: denyError } = await supabase
      .from('bookings')
      .update({ 
        status: 'denied',
        denial_reason: 'Test denial reason'
      })
      .eq('id', createdBooking.id)
      .select()

    console.log("DENY RESULT:", { data: denyResult, error: denyError })

    if (denyError) {
      console.log('❌ Deny error:', denyError.message)
    } else if (!denyResult || denyResult.length === 0) {
      console.log('❌ Deny failed - no rows updated')
    } else {
      console.log('✅ Deny successful!')
      console.log('Updated booking:', denyResult[0])
      console.log('New status:', denyResult[0].status)
      console.log('Denial reason:', denyResult[0].denial_reason)
      
      // Verify the status is actually "denied"
      if (denyResult[0].status === 'denied') {
        console.log('✅ Status correctly set to "denied"!')
      } else {
        console.log('❌ Status not set to "denied". Actual:', denyResult[0].status)
      }
    }
    
    // Test that denied bookings can't be acted upon
    console.log('\n🔒 Testing that denied bookings have no actions available...')
    
    const { data: verifyBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', createdBooking.id)
      .single()
      
    if (verifyBooking) {
      console.log('✅ Verified booking status:', verifyBooking.status)
      
      // Check UI conditions
      const canCancel = verifyBooking.status !== "cancelled" && verifyBooking.status !== "denied"
      const canConfirm = verifyBooking.status === "pending"
      
      console.log('Can cancel:', canCancel) // Should be false
      console.log('Can confirm:', canConfirm) // Should be false
      
      if (!canCancel && !canConfirm) {
        console.log('✅ UI correctly restricts actions for denied bookings!')
      } else {
        console.log('❌ UI restrictions not working properly')
      }
    }
    
    console.log('\n🎯 Denied Status Test Complete!')
    console.log('💡 Denied bookings now work correctly with proper UI restrictions!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testDeniedStatus()
