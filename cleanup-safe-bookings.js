// Safe Test Bookings Cleanup Script
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function safeCleanupTestBookings() {
  try {
    console.log('=== SAFE TEST BOOKINGS CLEANUP ===\n')
    
    // Try different login approaches
    console.log('1. Attempting admin access...')
    
    // Try with service role if available
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let client = supabase
    
    if (serviceKey) {
      console.log('🔑 Using service role key for elevated permissions')
      client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey
      )
    } else {
      // Try admin login
      console.log('👤 Using admin login...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: "admin@test.com",
        password: "Admin1234"
      })
      
      if (authError) {
        console.error('❌ Admin login failed:', authError.message)
        console.log('⚠️  Continuing with limited permissions...')
      } else {
        console.log('✅ Admin login successful!')
      }
    }
    
    // Get all bookings to analyze
    console.log('\n2. Analyzing current bookings...')
    const { data: allBookings, error: fetchError } = await client
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Failed to fetch bookings:', fetchError.message)
      return
    }
    
    console.log(`Found ${allBookings?.length || 0} total bookings`)
    
    // Identify test bookings by multiple patterns
    const testBookings = allBookings?.filter(booking => {
      const id = booking.id?.toLowerCase() || ''
      const title = booking.title?.toLowerCase() || ''
      const organizer = booking.organizer?.toLowerCase() || ''
      const description = booking.description?.toLowerCase() || ''
      
      // Multiple identification patterns
      const patterns = [
        // ID patterns
        id.startsWith('test') || 
        id.startsWith('sidebar') || 
        id.startsWith('delete') || 
        id.startsWith('cancel') ||
        id.startsWith('simple') ||
        id.startsWith('dup') ||
        (id.startsWith('b') && id.length < 20), // Short timestamp IDs
        
        // Title patterns
        title.includes('test') || 
        title.includes('Test') ||
        title.includes('Cancel Test') ||
        title.includes('Sidebar') ||
        title.includes('Delete') ||
        title.includes('Simple') ||
        title.includes('Comprehensive'),
        
        // Description patterns
        description.includes('test') ||
        description.includes('Test') ||
        description.includes('testing') ||
        description.includes('Testing'),
        
        // Organizer patterns
        organizer.includes('test operator') ||
        organizer.includes('Test Operator')
      ]
      
      return patterns.some(pattern => pattern)
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
    
    // Show detailed analysis
    console.log('\n🗑️  Test bookings identified:')
    testBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.title} (${booking.id})`)
      console.log(`      Venue: ${booking.venue_id}`)
      console.log(`      Date: ${booking.date}`)
      console.log(`      Organizer: ${booking.organizer}`)
      console.log(`      Status: ${booking.status}`)
      console.log(`      Created: ${booking.created_at}`)
    })
    
    // Show legitimate bookings
    if (legitimateBookings.length > 0) {
      console.log('\n💼 Legitimate bookings that will be preserved:')
      legitimateBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.title} (${booking.id})`)
        console.log(`      Organizer: ${booking.organizer}`)
        console.log(`      Status: ${booking.status}`)
      })
    }
    
    // Try different deletion strategies
    console.log('\n3. Attempting cleanup with multiple strategies...')
    
    let deletedCount = 0
    let errors = []
    
    // Strategy 1: Try direct deletion with service role
    if (serviceKey) {
      console.log('🔧 Strategy 1: Service role deletion...')
      for (const booking of testBookings) {
        try {
          const { error: deleteError } = await client
            .from('bookings')
            .delete()
            .eq('id', booking.id)
          
          if (deleteError) {
            errors.push(`Service role failed for ${booking.id}: ${deleteError.message}`)
          } else {
            deletedCount++
            console.log(`   ✅ Deleted (service): ${booking.title}`)
          }
        } catch (error) {
          errors.push(`Service role error for ${booking.id}: ${error.message}`)
        }
      }
    } else {
      // Strategy 2: Try admin user deletion
      console.log('🔧 Strategy 2: Admin user deletion...')
      for (const booking of testBookings) {
        try {
          const { error: deleteError } = await client
            .from('bookings')
            .delete()
            .eq('id', booking.id)
          
          if (deleteError) {
            errors.push(`Admin user failed for ${booking.id}: ${deleteError.message}`)
          } else {
            deletedCount++
            console.log(`   ✅ Deleted (admin): ${booking.title}`)
          }
        } catch (error) {
          errors.push(`Admin user error for ${booking.id}: ${error.message}`)
        }
      }
    }
    
    // Strategy 3: If all else fails, provide manual cleanup SQL
    if (deletedCount === 0 && errors.length > 0) {
      console.log('\n🔧 Strategy 3: Generating manual cleanup SQL...')
      console.log('⚠️  Permission denied. Manual cleanup required.')
      console.log('\n📝 SQL commands to run manually:')
      
      testBookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. DELETE FROM bookings WHERE id = '${booking.id}';`)
      })
      
      console.log('\n💡 Alternative: Update RLS policy to allow admin deletion')
      console.log('   Add this to your RLS policy:')
      console.log('   CREATE POLICY "Admin can delete any booking" ON bookings')
      console.log('   FOR DELETE USING (')
      console.log('     auth.jwt() ->> \'role\' = \'admin\' OR')
      console.log('     auth.uid() = created_by')
      console.log('   );')
    }
    
    // Report results
    console.log(`\n📈 Cleanup Results:`)
    console.log(`   Successfully deleted: ${deletedCount}`)
    console.log(`   Errors: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach(error => console.log(`   ${error}`))
    }
    
    // Final verification
    console.log('\n4. Final verification...')
    const { data: remainingBookings, error: verifyError } = await client
      .from('bookings')
      .select('*')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      const remainingTestBookings = remainingBookings?.filter(booking => {
        const id = booking.id?.toLowerCase() || ''
        const title = booking.title?.toLowerCase() || ''
        return id.startsWith('test') || 
               id.startsWith('sidebar') || 
               id.startsWith('delete') || 
               id.startsWith('cancel') ||
               id.startsWith('simple') ||
               id.startsWith('dup') ||
               (id.startsWith('b') && id.length < 20) ||
               title.includes('test') ||
               title.includes('Test')
      }) || []
      
      console.log(`\n📋 Final Status:`)
      console.log(`   Total remaining bookings: ${remainingBookings?.length || 0}`)
      console.log(`   Remaining test bookings: ${remainingTestBookings.length}`)
      console.log(`   Legitimate bookings preserved: ${(remainingBookings?.length || 0) - remainingTestBookings.length}`)
      
      if (remainingTestBookings.length === 0) {
        console.log('\n🎉 SUCCESS: All test bookings removed!')
        console.log('✅ Database is clean and ready for production!')
      } else {
        console.log(`\n⚠️  ${remainingTestBookings.length} test bookings remain`)
        console.log('🔧 Manual cleanup may be required')
      }
    }
    
    console.log('\n=== CLEANUP PROCESS COMPLETE ===')
    
  } catch (error) {
    console.error('❌ Cleanup script failed:', error)
  } finally {
    if (client && client.auth) {
      await client.auth.signOut()
    }
  }
}

// Main execution
if (require.main === module) {
  safeCleanupTestBookings()
}

module.exports = { safeCleanupTestBookings }
