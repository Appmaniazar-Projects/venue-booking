// Test the fixed data loading function
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Import the Supabase services
const { fetchInitialData } = require('./lib/supabase-services.js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFixedLoading() {
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
    
    // Test the fixed fetchInitialData function
    console.log('\n📦 Testing fixed data loading...')
    const data = await fetchInitialData()
    
    console.log(`✅ Venues loaded: ${data.venues.length}`)
    console.log(`✅ Bookings loaded: ${data.bookings.length}`)
    console.log(`✅ Parking areas loaded: ${data.parkingAreas.length}`)
    console.log(`✅ Roads loaded: ${data.roads.length}`)
    console.log(`✅ Trigger logs loaded: ${data.triggerLogs.length}`)
    console.log(`✅ Override logs loaded: ${data.overrideLogs.length}`)
    
    if (data.venues.length > 0) {
      console.log('\n🏟️  Sample venues:')
      data.venues.slice(0, 3).forEach(venue => {
        console.log(`  - ${venue.name} (${venue.type})`)
      })
    }
    
    console.log('\n🎯 Fixed data loading test complete!')
    console.log('💡 If venues load successfully, the app should work now')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFixedLoading()
