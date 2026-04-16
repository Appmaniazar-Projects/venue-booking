// Simple data migration script (no login required since RLS is disabled)
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Import compiled seed data
const { SEED_VENUES, SEED_BOOKINGS, SEED_PARKING_AREAS, SEED_ROADS } = require('../lib/seed-data.js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const demoOperatorId = process.env.DEMO_OPERATOR_USER_ID || null
const demoAdminId = process.env.DEMO_ADMIN_USER_ID || null

function resolveCreatedBy(seedBooking) {
  if (seedBooking.createdBy === 'admin') return demoAdminId
  if (seedBooking.createdBy === 'operator') return demoOperatorId
  return null
}

async function migrateData() {
  console.log('📦 Starting data migration...')
  if (!demoOperatorId || !demoAdminId) {
    console.warn('⚠️ DEMO_OPERATOR_USER_ID / DEMO_ADMIN_USER_ID not set. Seeded bookings will have null created_by.')
  }
  
  try {
    // Migrate venues
    console.log('Migrating venues...')
    for (const venue of SEED_VENUES) {
      const { error } = await supabase
        .from('venues')
        .upsert({
          id: venue.id,
          name: venue.name,
          type: venue.type,
          max_population: venue.maxPopulation,
          owner_name: venue.ownerName,
          owner_contact: venue.ownerContact,
          address: venue.address,
          image: venue.image,
          created_at: venue.createdAt
        }, { onConflict: 'id' })
      
      if (error) {
        console.error('Error inserting venue:', venue.name, error)
      } else {
        console.log('✓ Venue migrated:', venue.name)
      }
    }

    // Migrate bookings
    console.log('Migrating bookings...')
    for (const booking of SEED_BOOKINGS) {
      const { error } = await supabase
        .from('bookings')
        .upsert({
          id: booking.id,
          venue_id: booking.venueId,
          title: booking.title,
          description: booking.description || null,
          date: booking.date,
          start_time: booking.startTime,
          end_time: booking.endTime,
          expected_attendance: booking.expectedAttendance,
          organizer: booking.organizer,
          risk_level: booking.riskLevel,
          amplified_noise: booking.amplifiedNoise,
          liquor_license: booking.liquorLicense,
          status: booking.status,
          override_reason: booking.overrideReason || null,
          overridden_by: booking.overriddenBy || null,
          overridden_at: booking.overriddenAt || null,
          conflicts: booking.conflicts || [],
          created_by: resolveCreatedBy(booking),
          created_at: booking.createdAt
        }, { onConflict: 'id' })
      
      if (error) {
        console.error('Error inserting booking:', booking.title, error)
      } else {
        console.log('✓ Booking migrated:', booking.title)
      }
    }

    // Migrate parking areas
    console.log('Migrating parking areas...')
    for (const parkingArea of SEED_PARKING_AREAS) {
      const { error } = await supabase
        .from('parking_areas')
        .upsert({
          id: parkingArea.id,
          name: parkingArea.name,
          total_spaces: parkingArea.totalSpaces,
          allocated_spaces: parkingArea.allocatedSpaces,
          location: parkingArea.location,
          linked_venue_ids: parkingArea.linkedVenueIds
        }, { onConflict: 'id' })
      
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
        .upsert({
          id: road.id,
          name: road.name,
          status: road.status,
          closure_reason: road.closureReason,
          closure_start: road.closureStart,
          closure_end: road.closureEnd,
          linked_venue_ids: road.linkedVenueIds
        }, { onConflict: 'id' })
      
      if (error) {
        console.error('Error inserting road:', road.name, error)
      } else {
        console.log('✓ Road migrated:', road.name)
      }
    }

    console.log('✅ Data migration completed successfully!')
    console.log('🎉 Venue booking system is now ready!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Start the migration
migrateData()
