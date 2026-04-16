// Test venues loading only
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testVenuesOnly() {
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
    
    // Test venues fetch like the app does
    console.log('\n🏟️  Testing venues fetch (like app)...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (venuesError) {
      console.error('❌ Venues fetch error:', venuesError)
    } else {
      console.log(`✅ Successfully fetched ${venues?.length || 0} venues:`)
      venues?.forEach(venue => {
        console.log(`  - ID: ${venue.id}, Name: ${venue.name}, Type: ${venue.type}`)
      })
    }
    
    // Test bookings fetch like the app does
    console.log('\n📅 Testing bookings fetch (like app)...')
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        venues:venue_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('❌ Bookings fetch error:', bookingsError)
    } else {
      console.log(`✅ Successfully fetched ${bookings?.length || 0} bookings`)
    }
    
    console.log('\n🎯 Venue and booking test complete!')
    console.log('💡 If this works, the app should load venues properly')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testVenuesOnly()
