# Test Bookings Cleanup Instructions

## **PROBLEM IDENTIFIED:**
The RLS (Row Level Security) policies are preventing deletion of test bookings, even for admin users. The cleanup scripts are correctly identifying test bookings but cannot delete them due to permission restrictions.

## **SOLUTION OPTIONS:**

### **Option 1: Manual SQL Cleanup (Recommended)**
1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run the cleanup SQL** from `manual-cleanup-sql.sql`
4. **Verify results** with the SELECT queries

### **Option 2: Fix RLS Policy**
1. **Add admin deletion policy** to allow admins to delete any booking
2. **Run the cleanup script** again
3. **Verify cleanup** was successful

### **Option 3: Service Role Key**
1. **Add SUPABASE_SERVICE_ROLE_KEY** to your .env file
2. **Run cleanup script** with elevated permissions
3. **Verify cleanup** was successful

## **CURRENT STATUS:**

### **Test Bookings Found: 9**
1. `Test (b1776260547662)` - Tech.co organizer
2. `Fixed Test Booking (b1776260263150)` - Test Operator
3. `Test Event at Cape Town Stadium (test1776256751169)` - Test Operator
4. `Test Event at Cape Town Stadium (test1776256131376)` - Test Operator
5. `Tech (b1776239838583)` - Tech.co organizer
6. `AyaTech (b1775552775105)` - AyaTech Co organizer
7. `Comprehensive Test Booking (dup1775551026077)` - Test Admin
8. `Simple Deny Test (simple1775467242981)` - Test Admin
9. `TechVid (b1775129620850)` - AyaTech organizer

### **Legitimate Bookings: 0**
All current bookings appear to be test data.

## **IMMEDIATE ACTIONS:**

### **Step 1: Run Manual SQL Cleanup**
```sql
-- Copy and paste these commands into Supabase SQL Editor:
DELETE FROM bookings WHERE id LIKE 'test%';
DELETE FROM bookings WHERE id LIKE 'sidebar%';
DELETE FROM bookings WHERE id LIKE 'delete%';
DELETE FROM bookings WHERE id LIKE 'cancel%';
DELETE FROM bookings WHERE id LIKE 'simple%';
DELETE FROM bookings WHERE id LIKE 'dup%';
DELETE FROM bookings WHERE id LIKE 'b%' AND LENGTH(id) < 20;
DELETE FROM bookings WHERE title ILIKE '%test%';
DELETE FROM bookings WHERE organizer ILIKE '%Test Operator%';
```

### **Step 2: Verify Cleanup**
```sql
-- Check remaining bookings:
SELECT COUNT(*) as remaining_bookings FROM bookings;
SELECT id, title, organizer, status FROM bookings ORDER BY created_at DESC;
```

### **Step 3: Confirm Clean Database**
If the SELECT query returns 0 rows, the cleanup was successful and your database is ready for production use.

## **PREVENTION FOR FUTURE:**

### **Test Booking Best Practices:**
1. **Use consistent test prefixes** - `test_`, `dev_`, `sandbox_`
2. **Set test dates** in the past to avoid conflicts
3. **Clean up test data** immediately after testing
4. **Use separate test environment** when possible

### **RLS Policy Update:**
To prevent this issue in the future, add this policy:
```sql
CREATE POLICY "Admin can delete any booking" ON bookings
FOR DELETE USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.uid() = created_by
);
```

## **EXPECTED OUTCOME:**

After running the manual SQL cleanup:
- ✅ **0 test bookings remaining**
- ✅ **Clean database ready for production**
- ✅ **No clutter in booking interface**
- ✅ **Fresh start for real bookings**

## **NEXT STEPS:**

1. **Run the SQL cleanup** in Supabase Dashboard
2. **Verify all test bookings are removed**
3. **Test the booking system** with a real booking
4. **Confirm the interface** shows only legitimate data

**Your venue booking system will then be clean and ready for production use!**
