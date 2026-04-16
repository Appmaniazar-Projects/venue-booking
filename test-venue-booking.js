// Test Venue Booking Flow
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testVenueBookingFlow() {
  try {
    console.log('=== TESTING VENUE BOOKING FLOW ===\n')
    
    // Test 1: Login as operator
    console.log('1. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",
      password: "Operator1234"
    })
    
    if (authError) {
      console.log('❌ Operator login failed:', authError.message)
      console.log('Trying admin login for venue access test...')
      
      const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
        email: "admin@test.com", 
        password: "Admin1234"
      })
      
      if (adminError) {
        console.error('❌ Admin login also failed:', adminError.message)
        return
      }
      
      console.log('✅ Admin login successful (for testing venue access)')
    } else {
      console.log('✅ Operator login successful!')
    }
    
    // Test 2: Check venue access
    console.log('\n2. Testing venue access...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(3)
      
    if (venuesError) {
      console.log('❌ Venue access error:', venuesError.message)
    } else {
      console.log(`✅ Found ${venues?.length || 0} venues accessible`)
      venues?.forEach(v => {
        console.log(`   - ${v.name} (${v.type}) - Capacity: ${v.max_population}`)
      })
    }
    
    // Test 3: Test venue-specific booking creation
    if (venues && venues.length > 0) {
      console.log('\n3. Testing venue booking creation...')
      const testVenue = venues[0]
      
      const bookingData = {
        id: `test${Date.now()}`,
        venue_id: testVenue.id,
        title: `Test Event at ${testVenue.name}`,
        description: "Automated test booking",
        date: new Date().toISOString().split('T')[0],
        start_time: "10:00",
        end_time: "14:00",
        expected_attendance: 50,
        organizer: "Test Operator",
        risk_level: "low",
        amplified_noise: false,
        liquor_license: false,
        status: "pending",
        conflicts: [],
        created_at: new Date().toISOString()
      }
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()
        
      if (bookingError) {
        console.log('❌ Booking creation error:', bookingError.message)
      } else {
        console.log(`✅ Test booking created: ${booking.title}`)
        console.log(`   Venue: ${testVenue.name}`)
        console.log(`   Date: ${bookingData.date}`)
        console.log(`   Time: ${bookingData.start_time} - ${bookingData.end_time}`)
        
        // Clean up test booking
        await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id)
        console.log('🧹 Test booking cleaned up')
      }
    }
    
    console.log('\n=== VENUE BOOKING FEATURES TO TEST ===')
    console.log('1. Navigate to /venues as operator')
    console.log('2. Click on any venue to see details')
    console.log('3. Look for "Book Now" button (operators only)')
    console.log('4. Click "Book Now" to open simplified booking form')
    console.log('5. Fill form and check for conflict detection')
    console.log('6. Submit booking and verify creation')
    console.log('7. Check venue availability component')
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testVenueBookingFlow()
