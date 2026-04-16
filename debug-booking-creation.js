// Debug Booking Creation Issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugBookingCreation() {
  try {
    console.log('=== DEBUGGING BOOKING CREATION ISSUE ===\n')
    
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
    console.log('User ID:', authData.user?.id)
    console.log('Session active:', !!authData.session)
    
    // Test 2: Check if user session is valid
    console.log('\n2. Checking session validity...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session check failed:', sessionError.message)
    } else {
      console.log('Session valid:', !!sessionData.session)
      console.log('Session user ID:', sessionData.session?.user?.id)
    }
    
    // Test 3: Get venues for booking
    console.log('\n3. Getting venues for booking...')
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
    
    console.log('Using venue:', venue.name, '(ID:', venue.id, ')')
    
    // Test 4: Try to create a booking
    console.log('\n4. Testing booking creation...')
    const bookingData = {
      venue_id: venue.id,
      title: "Debug Test Booking",
      description: "Testing booking creation",
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
      created_by: authData.user?.id,
      created_at: new Date().toISOString()
    }
    
    console.log('Booking data:', JSON.stringify(bookingData, null, 2))
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (bookingError) {
      console.error('Booking creation failed:', bookingError.message)
      console.error('Error details:', bookingError.details)
      console.error('Error hint:', bookingError.hint)
      console.error('Error code:', bookingError.code)
      
      // Check if it's an RLS policy issue
      if (bookingError.code === '42501') {
        console.log('This appears to be an RLS policy issue!')
      }
    } else {
      console.log('Booking created successfully!')
      console.log('Booking ID:', booking.id)
      console.log('Booking status:', booking.status)
      
      // Test 5: Check if session is still valid after booking
      console.log('\n5. Checking session after booking...')
      const { data: postBookingSession, error: postSessionError } = await supabase.auth.getSession()
      
      if (postSessionError) {
        console.error('Post-booking session check failed:', postSessionError.message)
      } else {
        console.log('Session still valid:', !!postBookingSession.session)
      }
      
      // Cleanup test booking
      await supabase.from('bookings').delete().eq('id', booking.id)
      console.log('Test booking cleaned up')
    }
    
    // Test 6: Check RLS policies
    console.log('\n6. Checking RLS policies...')
    try {
      const { data: rlsCheck, error: rlsError } = await supabase
        .from('bookings')
        .select('id, title')
        .limit(1)
      
      if (rlsError) {
        console.error('RLS check failed:', rlsError.message)
      } else {
        console.log('RLS allows reading bookings')
      }
    } catch (error) {
      console.error('RLS check error:', error)
    }
    
    console.log('\n=== TROUBLESHOOTING TIPS ===')
    console.log('If booking creation fails and logs out:')
    console.log('1. Check RLS policies on bookings table')
    console.log('2. Verify user has insert permissions')
    console.log('3. Check if session expires during booking')
    console.log('4. Verify booking data structure matches table schema')
    console.log('5. Check for authentication token issues')
    
    console.log('\n=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('Debug failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

debugBookingCreation()
