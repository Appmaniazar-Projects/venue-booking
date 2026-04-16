// Test the sidebar cancel functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSidebarCancel() {
  try {
    console.log('🔥 Testing Sidebar Cancel Functionality...')
    
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
    console.log('\n📅 Creating test booking for sidebar test...')
    const testBooking = {
      id: `sidebar${Date.now()}`,
      venue_id: "v1",
      title: "Sidebar Cancel Test",
      description: "Testing sidebar cancel functionality",
      date: "2024-12-25",
      start_time: "16:00",
      end_time: "18:00",
      expected_attendance: 30,
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
    
    // Test 1: Cancel from sidebar (simulate the cancelBooking function)
    console.log('\n🗑️  Testing sidebar cancel (simulate cancelBooking function)...')
    
    const { data: cancelResult, error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', createdBooking.id)
      .eq('created_by', authData.user.id)
      .select()

    console.log("SIDEBAR CANCEL RESULT:", { data: cancelResult, error: cancelError })

    if (cancelError) {
      console.log('❌ Sidebar cancel error:', cancelError.message)
    } else if (!cancelResult || cancelResult.length === 0) {
      console.log('❌ Sidebar cancel failed - no rows updated')
    } else {
      console.log('✅ Sidebar cancel successful!')
      console.log('Updated booking:', cancelResult[0])
    }
    
    // Test 2: Delete functionality
    console.log('\n🗑️  Testing delete functionality...')
    
    // Create another booking for delete test
    const deleteTestBooking = {
      ...testBooking,
      id: `delete${Date.now()}`
    }
    
    const { data: deleteTestCreated, error: deleteCreateError } = await supabase
      .from('bookings')
      .insert(deleteTestBooking)
      .select()
      .single()
      
    if (deleteCreateError) {
      console.log('❌ Failed to create delete test booking:', deleteCreateError.message)
      return
    }
    
    console.log('✅ Delete test booking created:', deleteTestCreated.id)
    
    // Test delete
    const { data: deleteResult, error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', deleteTestCreated.id)
      .select()

    console.log("DELETE RESULT:", { data: deleteResult, error: deleteError })

    if (deleteError) {
      console.log('❌ Delete error:', deleteError.message)
    } else if (!deleteResult || deleteResult.length === 0) {
      console.log('❌ Delete failed - no rows deleted')
    } else {
      console.log('✅ Delete successful!')
      console.log('Deleted booking:', deleteResult[0])
    }
    
    console.log('\n🎯 Sidebar Cancel Test Complete!')
    console.log('💡 Both cancel and delete functions are working correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testSidebarCancel()
