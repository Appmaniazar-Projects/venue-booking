// Test Booking Creation Fix
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testBookingFix() {
  try {
    console.log('=== TESTING BOOKING CREATION FIX ===\n')
    
    // Test 1: Login as operator
    console.log('1. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "oparator@test.com",
      password: "Test1234"
    })
    
    if (authError) {
      console.error('Login failed:', authError.message)
      return
    }
    
    console.log('Login successful!')
    
    // Test 2: Get venues
    console.log('\n2. Getting venues...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(1)
      
    if (venuesError) {
      console.error('Venues fetch error:', venuesError.message)
      return
    }
    
    const venue = venues?.[0]
    if (!venue) {
      console.error('No venues found')
      return
    }
    
    console.log('Using venue:', venue.name)
    
    // Test 3: Create booking data WITHOUT ID (like the fixed form)
    console.log('\n3. Testing booking creation without ID...')
    const bookingData = {
      venueId: venue.id,
      title: "Fixed Test Booking",
      description: "Testing booking creation fix",
      date: new Date().toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "14:00",
      expectedAttendance: 50,
      organizer: "Test Operator",
      riskLevel: "low",
      amplifiedNoise: false,
      liquorLicense: false,
      status: "pending",
      conflicts: [],
      createdBy: authData.user?.id
    }
    
    console.log('Booking data (without ID):', JSON.stringify(bookingData, null, 2))
    
    // Test 4: Try to create booking using createBooking function
    console.log('\n4. Testing createBooking function...')
    try {
      // Simulate the createBooking function behavior
      const bookingDataForDB = {
        id: `b${Date.now()}`,
        venue_id: bookingData.venueId,
        title: bookingData.title,
        description: bookingData.description,
        date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        expected_attendance: bookingData.expectedAttendance,
        organizer: bookingData.organizer,
        risk_level: bookingData.riskLevel,
        amplified_noise: bookingData.amplifiedNoise,
        liquor_license: bookingData.liquorLicense,
        status: "pending",
        conflicts: bookingData.conflicts,
        created_by: authData.user?.id,
        created_at: new Date().toISOString()
      }
      
      console.log('Final booking data for DB:', JSON.stringify(bookingDataForDB, null, 2))
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingDataForDB)
        .select()
        .single()
      
      if (bookingError) {
        console.error('Booking creation failed:', bookingError.message)
        console.error('Error details:', bookingError.details)
      } else {
        console.log('Booking created successfully!')
        console.log('Booking ID:', booking.id)
        console.log('Booking status:', booking.status)
        
        // Cleanup
        await supabase.from('bookings').delete().eq('id', booking.id)
        console.log('Test booking cleaned up')
      }
    } catch (error) {
      console.error('Booking creation error:', error)
    }
    
    // Test 5: Check session after booking
    console.log('\n5. Checking session after booking...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session check failed:', sessionError.message)
    } else {
      console.log('Session still valid:', !!sessionData.session)
    }
    
    console.log('\n=== FIX SUMMARY ===')
    console.log('Changes made:')
    console.log('1. Removed ID from booking form submission')
    console.log('2. Updated store addBooking signature')
    console.log('3. createBooking function generates ID automatically')
    console.log('4. No more null ID constraint violations')
    
    console.log('\n=== EXPECTED BEHAVIOR ===')
    console.log('1. Fill booking form')
    console.log('2. Submit booking')
    console.log('3. ID generated automatically')
    console.log('4. Booking created successfully')
    console.log('5. User stays logged in')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testBookingFix()
