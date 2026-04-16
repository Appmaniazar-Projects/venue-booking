// Test Supabase connection with login first
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  try {
    console.log('🔥 Logging in first...')
    
    // Login with test credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      console.log('💡 You may need to create a test account first')
      return
    }
    
    console.log('✅ Login successful!')
    console.log('🔍 Testing database access...')
    
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
    
    console.log('\n🎉 Multi-user system ready!')
    console.log('📱 Start testing at: http://localhost:3000')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
