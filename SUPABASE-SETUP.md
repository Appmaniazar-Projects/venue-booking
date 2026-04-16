# Supabase Setup Guide

This guide will help you set up Supabase for the multi-user venue booking system.

## Prerequisites
- Supabase account (https://supabase.com)
- Node.js and npm installed
- Your Supabase project URL and anon key

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `venue-booking`
5. Set a strong database password
6. Choose a region closest to your users
7. Click "Create new project"

## Step 2: Set Up Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy the contents of `supabase-schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the schema

This will create:
- `venues` table
- `bookings` table with user relationships
- `trigger_logs` table
- `override_logs` table
- `parking_areas` table
- `roads` table
- Row Level Security policies
- Indexes for performance

## Step 3: Configure Environment Variables

1. In your Supabase project, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Update your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Data Migration

1. Install dependencies if needed:
```bash
npm install
```

2. Run the migration script:
```bash
node scripts/migrate-data.js
```

This will populate your database with:
- Sample venues
- Sample bookings
- Parking areas
- Road data

## Step 5: Test the System

1. Start the development server:
```bash
npm run dev
```

2. Test multi-user functionality:
   - Open two browser windows
   - Create operator account in one window
   - Create admin account in another window
   - Create a booking as operator
   - Verify admin sees the booking immediately

## Step 6: Verify Real-Time Features

1. Create a booking as operator
2. As admin, you should see:
   - The booking appear instantly in the dashboard
   - The booking appear in the calendar
   - Real-time updates when status changes

## Troubleshooting

### Common Issues

**"Missing Supabase env vars" error**
- Ensure your `.env` file has the correct URL and anon key
- Restart the development server after updating `.env`

**"Permission denied" errors**
- Check that RLS policies are properly set up
- Verify the SQL schema was executed successfully

**Real-time updates not working**
- Ensure Realtime is enabled in your Supabase project
- Check browser console for WebSocket connection errors

**Migration script fails**
- Verify your Supabase credentials are correct
- Check that the database tables were created successfully

### Database Reset

If you need to reset the database:

1. Go to SQL Editor in Supabase
2. Run: `TRUNCATE TABLE bookings, venues, trigger_logs, override_logs, parking_areas, roads RESTART IDENTITY CASCADE;`
3. Re-run the migration script

## Production Considerations

1. **Security**: Enable Row Level Security (included in schema)
2. **Performance**: Monitor database query performance
3. **Backups**: Enable automated backups in Supabase
4. **Rate Limiting**: Configure appropriate rate limits
5. **Monitoring**: Set up error tracking and monitoring

## Support

- Supabase Documentation: https://supabase.com/docs
- Real-time subscriptions: https://supabase.com/docs/guides/realtime
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

Your multi-user venue booking system is now ready for production use!
