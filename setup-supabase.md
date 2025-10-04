# 🚀 Supabase Setup Guide

## Step 1: Get Your Project Details

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Click on your "ledgerly" project
3. Go to Settings → API
4. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)

## Step 2: Set Up Database Schema

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click "Run" to execute the schema

## Step 3: Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## Step 4: Set Environment Variables in Vercel

In your Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 5: Update Your App

Replace Firebase imports with Supabase imports in your components:

```typescript
// Replace this:
import { useAuth } from '@/hooks/use-auth';

// With this:
import { useAuth } from '@/hooks/use-auth-supabase';
```

## Step 6: Test Your App

Your app should now be live at: `https://your-project.vercel.app`

