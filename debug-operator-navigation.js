// Debug Operator Navigation Issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugOperatorNavigation() {
  try {
    console.log('=== DEBUGGING OPERATOR NAVIGATION ISSUE ===\n')
    
    // Test 1: Login as operator
    console.log('1. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "oparator@test.com",
      password: "Test1234"
    })
    
    if (authError) {
      console.error('❌ Operator login failed:', authError.message)
      return
    }
    
    console.log('✅ Operator login successful!')
    console.log('   User ID:', authData.user?.id)
    console.log('   Email:', authData.user?.email)
    
    // Test 2: Check user metadata to see if role is set correctly
    console.log('\n2. Checking user metadata...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single()
      
    if (profileError) {
      console.log('❌ Profile fetch error:', profileError.message)
    } else {
      console.log('✅ Profile found:')
      console.log('   Email:', profileData.email)
      console.log('   Role:', profileData.role)
      console.log('   Created at:', profileData.created_at)
    }
    
    // Test 3: Check if navigation items are being filtered correctly
    console.log('\n3. Testing role-based navigation...')
    const navItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        roles: ["admin", "operator"],
      },
      {
        title: "Venues",
        href: "/venues", 
        icon: "Building2",
        roles: ["admin", "operator"],
      },
      {
        title: "Bookings",
        href: "/bookings",
        icon: "Ticket", 
        roles: ["admin"], // Should NOT include "operator"
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: "CalendarDays",
        roles: ["admin", "operator"],
      },
      {
        title: "Logs",
        href: "/logs",
        icon: "FileText",
        roles: ["admin"],
      },
    ]
    
    const operatorRole = "operator"
    const visibleItems = navItems.filter((item) =>
      item.roles.includes(operatorRole)
    )
    
    console.log('✅ Navigation items for operators:')
    visibleItems.forEach(item => {
      console.log(`   ✅ ${item.title} (${item.href})`)
    })
    
    console.log('\n❌ Items hidden from operators:')
    navItems.filter(item => !item.roles.includes(operatorRole)).forEach(item => {
      console.log(`   ❌ ${item.title} (${item.href})`)
    })
    
    // Test 4: Check venues access
    console.log('\n4. Testing venues access...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(3)
      
    if (venuesError) {
      console.error('❌ Venues access error:', venuesError.message)
    } else {
      console.log(`✅ Found ${venues?.length || 0} venues`)
      venues?.forEach((venue, index) => {
        console.log(`   ${index + 1}. ${venue.name} (${venue.type})`)
      })
    }
    
    console.log('\n=== TROUBLESHOOTING TIPS ===')
    console.log('If venues are not showing:')
    console.log('1. Check browser console for JavaScript errors')
    console.log('2. Verify user role is "operator"')
    console.log('3. Check if navigation is rendering correctly')
    console.log('4. Try direct URL: /venues')
    console.log('5. Check if RLS policies are blocking access')
    console.log('6. Verify component mounting without errors')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Debug failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

debugOperatorNavigation()
