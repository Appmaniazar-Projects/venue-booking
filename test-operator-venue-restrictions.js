// Test Operator Venue Restrictions
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testOperatorVenueRestrictions() {
  try {
    console.log('=== TESTING OPERATOR VENUE RESTRICTIONS ===\n')
    
    // Test 1: Login as operator
    console.log('1. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "operator@test.com",
      password: "Operator1234"
    })
    
    if (authError) {
      console.log('Operator login failed:', authError.message)
      console.log('Trying with admin@test.com as fallback...')
      
      const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
        email: "admin@test.com",
        password: "Admin1234"
      })
      
      if (adminError) {
        console.error('Both logins failed:', adminError.message)
        return
      }
      
      console.log('Admin login successful (for testing purposes)')
      console.log('NOTE: Test with operator@test.com for actual operator restrictions')
    } else {
      console.log('Operator login successful!')
    }
    
    // Test 2: Check if venues are visible
    console.log('\n2. Testing venue visibility...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(5)
      
    if (venuesError) {
      console.log('Venues fetch error:', venuesError.message)
    } else {
      console.log(`Found ${venues.length} venues - operators should be able to see these`)
      venues.forEach(v => {
        console.log(`   - ${v.name} (${v.type})`)
      })
    }
    
    // Test 3: Check venue details access
    if (venues && venues.length > 0) {
      console.log('\n3. Testing venue details access...')
      const { data: venueDetails, error: detailsError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venues[0].id)
        .single()
        
      if (detailsError) {
        console.log('Venue details error:', detailsError.message)
      } else {
        console.log(`Venue details accessible: ${venueDetails.name}`)
        console.log(`   - Address: ${venueDetails.address}`)
        console.log(`   - Capacity: ${venueDetails.max_population}`)
        console.log(`   - Owner: ${venueDetails.owner_name}`)
      }
    }
    
    console.log('\n=== UI RESTRICTIONS TO VERIFY ===')
    console.log('Manual testing required for UI restrictions:')
    console.log('1. Operator should NOT see "Add Venue" button on /venues')
    console.log('2. Operator should NOT see "Edit" button on venue detail page')
    console.log('3. Operator should NOT see "Delete" button on venue detail page')
    console.log('4. Operator SHOULD see all venue details and information')
    console.log('5. Operator SHOULD be able to navigate between venues')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testOperatorVenueRestrictions()
