// Test deny functionality and UI sync
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDenyUISync() {
  try {
    console.log('🔥 Testing Deny UI Sync...')
    
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
      id: `denyui${Date.now()}`,
      venue_id: "v1",
      title: "UI Sync Test",
      description: "Testing deny UI synchronization",
      date: "2024-12-25",
      start_time: "22:00",
      end_time: "23:00",
      expected_attendance: 35,
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
    
    // Test 1: Direct database deny (simulate backend)
    console.log('\n🗑️ Testing direct database deny...')
    
    const { data: directDenyResult, error: directDenyError } = await supabase
      .from('bookings')
      .update({ 
        status: 'denied',
        denial_reason: 'Direct test denial'
      })
      .eq('id', createdBooking.id)
      .select()

    console.log("DIRECT DENY RESULT:", { data: directDenyResult, error: directDenyError })

    if (directDenyError) {
      console.log('❌ Direct deny error:', directDenyError.message)
    } else if (!directDenyResult || directDenyResult.length === 0) {
      console.log('❌ Direct deny failed - no rows updated')
    } else {
      console.log('✅ Direct deny successful!')
      console.log('Status after deny:', directDenyResult[0].status)
    }
    
    // Test 2: Verify database state
    console.log('\n🔍 Verifying database state...')
    
    const { data: verifyBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', createdBooking.id)
      .single()
      
    if (verifyBooking) {
      console.log('✅ Verified booking from database:')
      console.log('  - ID:', verifyBooking.id)
      console.log('  - Status:', verifyBooking.status)
      console.log('  - Denial reason:', verifyBooking.denial_reason)
      
      if (verifyBooking.status === 'denied') {
        console.log('✅ SUCCESS: Status is correctly "denied" in database!')
      } else {
        console.log('❌ ISSUE: Status is not "denied" in database. Actual:', verifyBooking.status)
      }
    } else {
      console.log('❌ Could not verify booking state')
    }
    
    console.log('\n🎯 UI Sync Test Complete!')
    console.log('💡 If status is "denied" in database but UI shows "pending",')
    console.log('   then the issue is UI not refreshing after deny action.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testDenyUISync()
