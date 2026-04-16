# Admin Functionality Test Guide

## Testing Admin Login and Dashboard

### 1. Create Admin Account
1. Navigate to http://localhost:3000/admin-signup
2. Fill in the form:
   - Email: admin@test.com
   - Password: admin123
   - Admin Key: admin2024
3. Submit the form
4. Check email for confirmation (or check if auto-confirmed)

### 2. Test Admin Login
1. Navigate to http://localhost:3000/login
2. Use admin credentials:
   - Email: admin@test.com
   - Password: admin123
3. Verify successful login with "Signed in successfully as Admin" message
4. Verify redirect to /dashboard

### 3. Verify Admin Dashboard Access
1. Check that sidebar shows admin-only items:
   - Venues (admin only)
   - Logs (admin only)
   - Dashboard, Bookings, Calendar (both roles)
2. Verify role indicator shows "Admin" with shield icon
3. Test that role switching is disabled (no "Switch" badge)

### 4. Test Admin Pages
1. Navigate to /venues:
   - Verify venue management interface loads
   - Test adding a new venue
2. Navigate to /logs:
   - Verify system logs interface loads
   - Check trigger and override logs tabs

### 5. Test Operator Account (for comparison)
1. Create operator account at /signup
2. Login as operator
3. Verify restricted access (no Venues/Logs in sidebar)
4. Verify role indicator shows "Operator"

## Key Features Implemented

✅ Admin signup page with admin key protection
✅ Role-based authentication detection
✅ Admin-only navigation items
✅ Role indicators in sidebar
✅ Role switching disabled when authenticated
✅ Admin dashboard pages (Venues, Logs)
✅ Updated login/signup flows with admin links

## Security Notes
- Admin signup requires admin key ("admin2024")
- In production, use more secure admin account creation
- Role is stored in Supabase user_metadata
- Role-based access control enforced throughout
