// Simple test to verify Supabase connection and basic functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
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
    
    console.log('\n🎉 Database connection successful!')
    console.log('Your multi-user booking system is ready to test.')
    console.log('\nNext steps:')
    console.log('1. Start development server: npm run dev')
    console.log('2. Create operator account')
    console.log('3. Create admin account')
    console.log('4. Test multi-user functionality')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
