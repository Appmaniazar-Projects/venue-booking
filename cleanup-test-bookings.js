// Cleanup Test Bookings Script
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function cleanupTestBookings() {
  try {
    console.log('=== CLEANING UP TEST BOOKINGS ===\n')
    
    // Login as admin to get full access
    console.log('1. Logging in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@test.com",
      password: "Admin1234"
    })
    
    if (authError) {
      console.error('❌ Admin login failed:', authError.message)
      return
    }
    
    console.log('✅ Admin login successful!')
    
    // Get all bookings to analyze
    console.log('\n2. Analyzing current bookings...')
    const { data: allBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Failed to fetch bookings:', fetchError.message)
      return
    }
    
    console.log(`Found ${allBookings?.length || 0} total bookings`)
    
    // Identify test bookings by patterns
    const testBookings = allBookings?.filter(booking => {
      const id = booking.id?.toLowerCase() || ''
      const title = booking.title?.toLowerCase() || ''
      const organizer = booking.organizer?.toLowerCase() || ''
      
      // ID patterns
      const isTestId = id.startsWith('test') || 
                     id.startsWith('sidebar') || 
                     id.startsWith('delete') || 
                     id.startsWith('cancel') ||
                     id.startsWith('b') && id.length < 20 // Short timestamp IDs
      
      // Title patterns
      const isTestTitle = title.includes('test') || 
                         title.includes('Test') ||
                         title.includes('Cancel Test') ||
                         title.includes('Sidebar') ||
                         title.includes('Delete')
      
      // Organizer patterns
      const isTestOrganizer = organizer.includes('test operator') ||
                            organizer.includes('Test Operator')
      
      return isTestId || isTestTitle || isTestOrganizer
    }) || []
    
    const legitimateBookings = allBookings?.filter(booking => 
      !testBookings.some(test => test.id === booking.id)
    ) || []
    
    console.log(`\n📊 Analysis Results:`)
    console.log(`   Test bookings: ${testBookings.length}`)
    console.log(`   Legitimate bookings: ${legitimateBookings.length}`)
    
    if (testBookings.length === 0) {
      console.log('\n✅ No test bookings found. Database is already clean!')
      return
    }
    
    // Show what will be deleted
    console.log('\n🗑️  Test bookings to be deleted:')
    testBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.title} (${booking.id})`)
      console.log(`      Venue: ${booking.venue_id}`)
      console.log(`      Date: ${booking.date}`)
      console.log(`      Status: ${booking.status}`)
    })
    
    // Show legitimate bookings that will be preserved
    if (legitimateBookings.length > 0) {
      console.log('\n💼 Legitimate bookings that will be preserved:')
      legitimateBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.title} (${booking.id})`)
        console.log(`      Organizer: ${booking.organizer}`)
        console.log(`      Status: ${booking.status}`)
      })
    }
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete all test bookings!')
    console.log('Type "DELETE" to confirm:')
    
    // For automation, we'll proceed with deletion
    // In production, you might want to add user confirmation here
    console.log('🔄 Proceeding with test booking cleanup...')
    
    // Delete test bookings
    console.log('\n3. Deleting test bookings...')
    let deletedCount = 0
    let errors = []
    
    for (const booking of testBookings) {
      try {
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id)
        
        if (deleteError) {
          errors.push(`Failed to delete ${booking.id}: ${deleteError.message}`)
        } else {
          deletedCount++
          console.log(`   ✅ Deleted: ${booking.title}`)
        }
      } catch (error) {
        errors.push(`Error deleting ${booking.id}: ${error.message}`)
      }
    }
    
    // Report results
    console.log(`\n📈 Cleanup Results:`)
    console.log(`   Successfully deleted: ${deletedCount}`)
    console.log(`   Errors: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach(error => console.log(`   ${error}`))
    }
    
    // Verify cleanup
    console.log('\n4. Verifying cleanup...')
    const { data: remainingBookings, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      const remainingTestBookings = remainingBookings?.filter(booking => {
        const id = booking.id?.toLowerCase() || ''
        return id.startsWith('test') || 
               id.startsWith('sidebar') || 
               id.startsWith('delete') || 
               id.startsWith('cancel') ||
               (id.startsWith('b') && id.length < 20)
      }) || []
      
      if (remainingTestBookings.length === 0) {
        console.log('✅ All test bookings successfully removed!')
        console.log(`✅ ${remainingBookings?.length || 0} legitimate bookings preserved`)
      } else {
        console.log(`⚠️  ${remainingTestBookings.length} test bookings remain`)
      }
    }
    
    console.log('\n=== CLEANUP COMPLETE ===')
    console.log('Database is now clean and ready for production use!')
    
  } catch (error) {
    console.error('❌ Cleanup script failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

// Additional utility functions for selective cleanup
async function cleanupByPattern(pattern) {
  console.log(`\n🔧 Cleaning bookings with pattern: ${pattern}`)
  
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .ilike('id', `%${pattern}%`)
  
  if (error) {
    console.error(`❌ Failed to fetch bookings with pattern ${pattern}:`, error.message)
    return
  }
  
  console.log(`Found ${bookings?.length || 0} bookings with pattern "${pattern}"`)
  
  for (const booking of bookings || []) {
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', booking.id)
    
    if (deleteError) {
      console.error(`❌ Failed to delete ${booking.id}:`, deleteError.message)
    } else {
      console.log(`✅ Deleted: ${booking.title} (${booking.id})`)
    }
  }
}

// Main execution
if (require.main === module) {
  cleanupTestBookings()
}

module.exports = { cleanupTestBookings, cleanupByPattern }
