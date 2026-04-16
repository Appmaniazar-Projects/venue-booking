// Debug Booking Button Issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugBookingButton() {
  try {
    console.log('=== DEBUGGING BOOKING BUTTON ISSUE ===\n')
    
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
    
    // Test 2: Get venues data
    console.log('\n2. Getting venues data...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(5)
      
    if (venuesError) {
      console.error('Venues fetch error:', venuesError.message)
      return
    }
    
    console.log(`Found ${venues?.length || 0} venues:`)
    venues?.forEach((venue, index) => {
      console.log(`   ${index + 1}. ${venue.name} (ID: ${venue.id})`)
      console.log(`      - Max Population: ${venue.maxPopulation}`)
      console.log(`      - Type: ${venue.type}`)
      console.log(`      - Address: ${venue.address}`)
    })
    
    // Test 3: Check booking form venue lookup
    console.log('\n3. Testing venue lookup for booking form...')
    const testVenueId = venues?.[0]?.id
    if (testVenueId) {
      console.log(`Looking up venue with ID: ${testVenueId}`)
      const foundVenue = venues?.find(v => v.id === testVenueId)
      if (foundVenue) {
        console.log('Venue found successfully:')
        console.log(`   Name: ${foundVenue.name}`)
        console.log(`   Max Population: ${foundVenue.maxPopulation}`)
        console.log(`   Type: ${foundVenue.type}`)
        
        // Test 4: Simulate booking form data
        console.log('\n4. Testing booking form data structure...')
        const bookingFormData = {
          venueId: foundVenue.id,
          venueName: foundVenue.name,
          maxPopulation: foundVenue.maxPopulation,
          venueType: foundVenue.type
        }
        console.log('Booking form data:')
        console.log(JSON.stringify(bookingFormData, null, 2))
        
      } else {
        console.error('Venue lookup failed!')
      }
    }
    
    // Test 5: Check permissions
    console.log('\n5. Checking database permissions...')
    try {
      const { data: testData, error: testError } = await supabase
        .from('venues')
        .select('id, name')
        .limit(1)
      
      if (testError) {
        console.error('Permission error:', testError.message)
      } else {
        console.log('Permissions OK - can access venues')
      }
    } catch (error) {
      console.error('Permission test failed:', error)
    }
    
    console.log('\n=== TROUBLESHOOTING TIPS ===')
    console.log('If booking form disappears immediately:')
    console.log('1. Check if venue lookup returns undefined')
    console.log('2. Verify venue data structure is correct')
    console.log('3. Check if booking form has error handling')
    console.log('4. Ensure button click prevents link navigation')
    console.log('5. Check browser console for JavaScript errors')
    
    console.log('\n=== EXPECTED BEHAVIOR ===')
    console.log('1. Click "Book Venue" button')
    console.log('2. Form opens with venue pre-filled')
    console.log('3. Form stays open until submitted or closed')
    console.log('4. Booking creation works successfully')
    
    console.log('\n=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('Debug failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

debugBookingButton()
