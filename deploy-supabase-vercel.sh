#!/bin/bash

echo "🚀 Deploying Ledgerly to Supabase + Vercel"

# Step 1: Create Supabase project (manual step)
echo "📋 Step 1: Create Supabase project"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Choose your organization"
echo "4. Enter project name: 'ledgerly'"
echo "5. Set a database password"
echo "6. Choose a region close to your users"
echo "7. Click 'Create new project'"
echo ""
echo "Press Enter when you've created the Supabase project..."

# Step 2: Set up environment variables
echo "📋 Step 2: Set up environment variables"
echo "You'll need to add these to your Vercel project:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""

# Step 3: Initialize Supabase locally
echo "📋 Step 3: Initialize Supabase"
npx supabase init

# Step 4: Link to remote project
echo "📋 Step 4: Link to remote project"
echo "Run: npx supabase link --project-ref your-project-ref"
echo ""

# Step 5: Deploy database schema
echo "📋 Step 5: Deploy database schema"
echo "Run: npx supabase db push"
echo ""

# Step 6: Deploy Edge Functions
echo "📋 Step 6: Deploy Edge Functions"
echo "Run: npx supabase functions deploy"
echo ""

# Step 7: Deploy to Vercel
echo "📋 Step 7: Deploy to Vercel"
echo "Run: npx vercel --prod"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app will be available at: https://your-project.vercel.app"
echo "📊 Supabase Dashboard: https://supabase.com/dashboard/project/your-project"
echo "⚡ Vercel Dashboard: https://vercel.com/dashboard"
