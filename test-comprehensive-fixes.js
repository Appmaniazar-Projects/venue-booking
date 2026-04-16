// Comprehensive Test for Booking Duplication and Status Update Fixes
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testComprehensiveFixes() {
  try {
    console.log('=== COMPREHENSIVE BOOKING FIXES TEST ===\n')
    
    // Login as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('Login failed:', authError.message)
      return
    }
    
    console.log('1. Admin login successful!')
    
    // Test 1: Create a booking
    console.log('\n2. Creating test booking...')
    const testBooking = {
      id: `test${Date.now()}`,
      venue_id: "v1",
      title: "Comprehensive Test Booking",
      description: "Testing all fixes",
      date: "2024-12-26",
      start_time: "10:00",
      end_time: "12:00",
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
      console.log('Create booking error:', createError.message)
      return
    }
    
    console.log('   Booking created successfully:', createdBooking.id)
    
    // Test 2: Try to create duplicate (should fail with constraints)
    console.log('\n3. Testing duplicate prevention...')
    const duplicateBooking = {
      ...testBooking,
      id: `dup${Date.now()}`
    }
    
    const { data: duplicateResult, error: duplicateError } = await supabase
      .from('bookings')
      .insert(duplicateBooking)
      .select()
      
    if (duplicateError) {
      console.log('   Duplicate prevention working:', duplicateError.message)
    } else {
      console.log('   WARNING: Duplicate prevention failed!')
    }
    
    // Test 3: Confirm booking (should work)
    console.log('\n4. Testing confirm booking...')
    try {
      const { data: confirmResult, error: confirmError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', createdBooking.id)
        .select()
        
      if (confirmError) {
        console.log('   Confirm error:', confirmError.message)
      } else {
        console.log('   Confirm successful:', confirmResult[0].status)
      }
    } catch (error) {
      console.log('   Confirm exception:', error.message)
    }
    
    // Test 4: Deny booking (should work)
    console.log('\n5. Testing deny booking...')
    try {
      const { data: denyResult, error: denyError } = await supabase
        .from('bookings')
        .update({ 
          status: 'denied',
          denial_reason: 'Test denial from comprehensive test'
        })
        .eq('id', createdBooking.id)
        .select()
        
      if (denyError) {
        console.log('   Deny error:', denyError.message)
      } else {
        console.log('   Deny successful:', denyResult[0].status)
        console.log('   Denial reason:', denyResult[0].denial_reason)
      }
    } catch (error) {
      console.log('   Deny exception:', error.message)
    }
    
    // Test 5: Cancel booking (should work)
    console.log('\n6. Testing cancel booking...')
    try {
      const { data: cancelResult, error: cancelError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', createdBooking.id)
        .select()
        
      if (cancelError) {
        console.log('   Cancel error:', cancelError.message)
      } else {
        console.log('   Cancel successful:', cancelResult[0].status)
      }
    } catch (error) {
      console.log('   Cancel exception:', error.message)
    }
    
    // Test 6: Verify final state
    console.log('\n7. Verifying final booking state...')
    const { data: finalBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', createdBooking.id)
      .single()
      
    if (finalBooking) {
      console.log('   Final status:', finalBooking.status)
      console.log('   Has denial_reason:', !!finalBooking.denial_reason)
      console.log('   Has cancelled_at:', !!finalBooking.cancelled_at)
    }
    
    console.log('\n=== TEST COMPLETE ===')
    console.log('All fixes have been tested. Review the results above.')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testComprehensiveFixes()
