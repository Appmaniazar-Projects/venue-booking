// Data migration script to populate Supabase with initial data
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Import compiled seed data
const { SEED_VENUES, SEED_PARKING_AREAS, SEED_ROADS } = require('../lib/seed-data.js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function loginAndMigrate() {
  console.log('🔥 Logging in first...')
  
  // Login with test credentials
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "operator@test.com",
    password: "Test@1234"
  })
  
  if (authError) {
    console.error('❌ Login failed:', authError.message)
    console.log('💡 You may need to create a test account first')
    return
  }
  
  console.log('✅ Login successful!')
  console.log('📦 Starting data migration...')
  
  await migrateData()
}

async function migrateData() {
  try {
    // Migrate venues
    console.log('Migrating venues...')
    for (const venue of SEED_VENUES) {
      const { error } = await supabase
        .from('venues')
        .insert({
          id: venue.id,
          name: venue.name,
          type: venue.type,
          max_population: venue.maxPopulation,
          owner_name: venue.ownerName,
          owner_contact: venue.ownerContact,
          address: venue.address,
          image: venue.image,
          created_at: venue.createdAt
        })
      
      if (error) {
        console.error('Error inserting venue:', venue.name, error)
      } else {
        console.log('✓ Venue migrated:', venue.name)
      }
    }

    // Migrate parking areas
    console.log('Migrating parking areas...')
    for (const parkingArea of SEED_PARKING_AREAS) {
      const { error } = await supabase
        .from('parking_areas')
        .insert({
          id: parkingArea.id,
          name: parkingArea.name,
          total_spaces: parkingArea.totalSpaces,
          allocated_spaces: parkingArea.allocatedSpaces,
          location: parkingArea.location,
          linked_venue_ids: parkingArea.linkedVenueIds
        })
      
      if (error) {
        console.error('Error inserting parking area:', parkingArea.name, error)
      } else {
        console.log('✓ Parking area migrated:', parkingArea.name)
      }
    }

    // Migrate roads
    console.log('Migrating roads...')
    for (const road of SEED_ROADS) {
      const { error } = await supabase
        .from('roads')
        .insert({
          id: road.id,
          name: road.name,
          status: road.status,
          closure_reason: road.closureReason,
          closure_start: road.closureStart,
          closure_end: road.closureEnd,
          linked_venue_ids: road.linkedVenueIds
        })
      
      if (error) {
        console.error('Error inserting road:', road.name, error)
      } else {
        console.log('✓ Road migrated:', road.name)
      }
    }

    console.log('✅ Data migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Start the migration
loginAndMigrate()
