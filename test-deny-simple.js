// Simple test to check if deny works at all
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDenySimple() {
  try {
    console.log('🔥 Testing Simple Deny Function...')
    
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
      id: `simple${Date.now()}`,
      venue_id: "v1",
      title: "Simple Deny Test",
      description: "Testing simple deny functionality",
      date: "2024-12-25",
      start_time: "23:00",
      end_time: "00:00",
      expected_attendance: 20,
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
    console.log('Status before deny:', createdBooking.status)
    
    // Test deny with the exact same function as UI uses
    console.log('\n🚫 Testing deny with exact UI function logic...')
    
    // This is the exact function from supabase-services.ts
    const { data: denyResult, error: denyError } = await supabase
      .from('bookings')
      .update({ 
        status: 'denied',
        denial_reason: 'Test denial from simple test'
      })
      .eq('id', createdBooking.id)
      .select()

    console.log("DENY FUNCTION RESULT:", { data: denyResult, error: denyError })

    if (denyError) {
      console.log('❌ Deny function error:', denyError.message)
      console.log('This is a backend/database issue')
    } else if (!denyResult || denyResult.length === 0) {
      console.log('❌ Deny function returned no data')
      console.log('This means the update affected 0 rows')
    } else {
      console.log('✅ Deny function returned data:')
      console.log('  - Status:', denyResult[0].status)
      console.log('  - Denial reason:', denyResult[0].denial_reason)
      
      if (denyResult[0].status === 'denied') {
        console.log('✅ SUCCESS: Database correctly updated to "denied"')
      } else {
        console.log('❌ ISSUE: Database status is:', denyResult[0].status)
      }
    }
    
    // Verify by querying the database directly
    console.log('\n🔍 Verifying by direct database query...')
    
    const { data: verifyResult } = await supabase
      .from('bookings')
      .select('status, denial_reason')
      .eq('id', createdBooking.id)
      .single()
      
    if (verifyResult) {
      console.log('✅ Direct verification result:')
      console.log('  - Status in DB:', verifyResult.status)
      console.log('  - Denial reason in DB:', verifyResult.denial_reason)
      
      if (verifyResult.status === 'denied') {
        console.log('✅ CONFIRMED: Booking is "denied" in database')
        console.log('🎯 If UI still shows "pending", the issue is UI refresh/sync')
      } else {
        console.log('❌ PROBLEM: Booking is not "denied" in database')
        console.log('  - Actual status:', verifyResult.status)
      }
    } else {
      console.log('❌ Could not verify booking')
    }
    
    console.log('\n🎯 Simple Deny Test Complete!')
    console.log('💡 This test isolates the deny function from UI issues')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testDenySimple()
