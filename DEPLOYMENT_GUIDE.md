# 🚀 Ledgerly Deployment Guide - Supabase + Vercel

## Prerequisites ✅
- ✅ Supabase project created
- ✅ Vercel CLI installed
- ✅ All dependencies installed

## Step 1: Set Up Supabase Database

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Click on your "ledgerly" project**
3. **Go to SQL Editor** (left sidebar)
4. **Copy and paste the entire contents of `supabase-schema.sql`**
5. **Click "Run" to execute the schema**

## Step 2: Get Your Supabase Credentials

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJ...` (starts with eyJ)

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod
```

### Option B: Using Vercel Dashboard
1. **Go to https://vercel.com/dashboard**
2. **Click "New Project"**
3. **Import your GitHub repository** (if connected) or **upload your project**
4. **Set framework to "Next.js"**
5. **Click "Deploy"**

## Step 4: Configure Environment Variables

**In your Vercel dashboard:**
1. **Go to your project settings**
2. **Click "Environment Variables"**
3. **Add these variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Update Your App Code

**Replace Firebase imports with Supabase imports:**

```typescript
// In your components, replace:
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';

// With:
import { useAuth } from '@/hooks/use-auth-supabase';
import { useNotifications } from '@/hooks/use-notifications-supabase';
```

## Step 6: Test Your Application

1. **Your app will be available at**: `https://your-project.vercel.app`
2. **Test the following features:**
   - User registration/login
   - Dashboard functionality
   - Creditor management
   - Loan applications
   - Notifications

## 🔧 Troubleshooting

### If you get authentication errors:
- Check that your Supabase URL and Anon Key are correct
- Ensure RLS policies are properly set up

### If you get database errors:
- Verify the schema was deployed correctly
- Check the Supabase logs in the dashboard

### If you get build errors:
- Make sure all dependencies are installed
- Check that environment variables are set correctly

## 📊 What You Get

- **Free hosting** on Vercel
- **Free database** on Supabase
- **Real-time features** with Supabase
- **Global CDN** for fast loading
- **Automatic deployments** from Git
- **Environment management** in Vercel

## 🎉 Success!

Once deployed, your Ledgerly application will be live and accessible to users worldwide!

**Your app URL**: `https://your-project.vercel.app`
**Supabase Dashboard**: `https://supabase.com/dashboard/project/your-project`
**Vercel Dashboard**: `https://vercel.com/dashboard`

