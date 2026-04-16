// Test with service role key
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Use service role key instead of anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env')
  console.log('You need to generate a service role key in Supabase:')
  console.log('1. Go to Settings > API')
  console.log('2. Create new service_role key')
  console.log('3. Add SUPABASE_SERVICE_ROLE_KEY to .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function testConnection() {
  try {
    console.log('Testing with service role key...')
    
    // Test reading venues
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(1)
    
    if (venuesError) {
      console.error('❌ Venues test failed:', venuesError)
    } else {
      console.log('✅ Venues table accessible')
    }
    
    // Test reading bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)
    
    if (bookingsError) {
      console.error('❌ Bookings test failed:', bookingsError)
    } else {
      console.log('✅ Bookings table accessible')
    }
    
    console.log('\n🎉 Service role works! Database ready!')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
