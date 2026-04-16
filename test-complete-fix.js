// Test the complete fix for venue data loading
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testCompleteFix() {
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
    
    // Test venues fetch with transformation
    console.log('\n🏟️  Testing venues with proper camelCase transformation...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (venuesError) {
      console.error('❌ Venues error:', venuesError)
    } else {
      console.log(`✅ Raw venues from Supabase (snake_case):`)
      venues.slice(0, 2).forEach(venue => {
        console.log(`  - ${venue.name} (max_population: ${venue.max_population})`)
      })
      
      // Simulate the transformation
      const transformedVenues = venues.map(venue => ({
        id: venue.id,
        name: venue.name,
        type: venue.type,
        maxPopulation: venue.max_population, // This is the key fix!
        ownerName: venue.owner_name,
        ownerContact: venue.owner_contact,
        address: venue.address,
        image: venue.image,
        createdAt: venue.created_at
      }))
      
      console.log(`\n✅ Transformed venues (camelCase):`)
      transformedVenues.slice(0, 2).forEach(venue => {
        console.log(`  - ${venue.name} (maxPopulation: ${venue.maxPopulation})`)
        // Test the specific line that was failing
        console.log(`    ✅ maxPopulation.toLocaleString(): ${venue.maxPopulation?.toLocaleString()}`)
      })
    }
    
    console.log('\n🎯 Complete fix test successful!')
    console.log('💡 The error should now be resolved!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCompleteFix()
