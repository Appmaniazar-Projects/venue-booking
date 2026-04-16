// Check what data exists in the database
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkData() {
  try {
    console.log('🔥 Logging in...')
    
    // Login with admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Login successful!')
    
    // Check venues
    console.log('\n🏟️  Checking venues...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
    
    if (venuesError) {
      console.error('❌ Venues error:', venuesError)
    } else {
      console.log(`✅ Found ${venues?.length || 0} venues:`)
      venues?.forEach(venue => {
        console.log(`  - ${venue.name} (${venue.type})`)
      })
    }
    
    // Check bookings
    console.log('\n📅 Checking bookings...')
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
    
    if (bookingsError) {
      console.error('❌ Bookings error:', bookingsError)
    } else {
      console.log(`✅ Found ${bookings?.length || 0} bookings:`)
      bookings?.forEach(booking => {
        console.log(`  - ${booking.title} at ${booking.date}`)
      })
    }
    
    // Check parking areas
    console.log('\n🚗 Checking parking areas...')
    const { data: parking, error: parkingError } = await supabase
      .from('parking_areas')
      .select('*')
    
    if (parkingError) {
      console.error('❌ Parking error:', parkingError)
    } else {
      console.log(`✅ Found ${parking?.length || 0} parking areas:`)
      parking?.forEach(area => {
        console.log(`  - ${area.name}`)
      })
    }
    
    console.log('\n🎯 Database check complete!')
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkData()
