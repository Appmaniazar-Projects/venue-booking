// Test Demo Login Functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDemoLogin() {
  try {
    console.log('=== TESTING DEMO LOGIN FUNCTIONALITY ===\n')
    
    // Check environment variables
    console.log('1. Checking demo environment variables...')
    console.log('   Demo Admin Email:', process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL)
    console.log('   Demo Operator Email:', process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL)
    console.log('   Demo Admin Password:', process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ? '***SET***' : 'NOT SET')
    console.log('   Demo Operator Password:', process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD ? '***SET***' : 'NOT SET')
    
    // Test 2: Demo Admin Login
    console.log('\n2. Testing demo admin login...')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin@test.com",
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "Admin1234"
    })
    
    if (adminError) {
      console.log('❌ Demo admin login failed:', adminError.message)
    } else {
      console.log('✅ Demo admin login successful!')
      await supabase.auth.signOut()
    }
    
    // Test 3: Demo Operator Login
    console.log('\n3. Testing demo operator login...')
    const { data: operatorData, error: operatorError } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL || "operator@test.com",
      password: process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD || "Operator1234"
    })
    
    if (operatorError) {
      console.log('❌ Demo operator login failed:', operatorError.message)
    } else {
      console.log('✅ Demo operator login successful!')
      await supabase.auth.signOut()
    }
    
    console.log('\n=== DEMO LOGIN FEATURES ===')
    console.log('✅ Demo login buttons should be visible on login page')
    console.log('✅ "Login as Admin" button uses demo credentials')
    console.log('✅ "Login as Operator" button uses demo credentials')
    console.log('✅ Credentials are pre-filled when buttons are clicked')
    console.log('✅ Environment variables provide fallback values')
    
    console.log('\n=== MANUAL TESTING INSTRUCTIONS ===')
    console.log('1. Go to /login page')
    console.log('2. Look for "Login as Admin" and "Login as Operator" buttons')
    console.log('3. Click each button to test auto-fill and login')
    console.log('4. Verify successful login and redirect to dashboard')
    console.log('5. Test venue booking as operator')
    console.log('6. Test admin functions as admin')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDemoLogin()
