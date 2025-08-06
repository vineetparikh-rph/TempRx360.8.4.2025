# 🚨 URGENT: Fix 500 Error - Add Clerk Environment Variables

## 🔍 **PROBLEM:**
The site is showing a 500 error because **Clerk environment variables are missing** from Vercel.

## 🔧 **SOLUTION:**

### **STEP 1: Get Your Clerk Keys**

1. **Go to Clerk Dashboard:** https://dashboard.clerk.com
2. **Select your TempRx360 project**
3. **Go to:** Developers → API Keys
4. **Copy these two values:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

### **STEP 2: Add Environment Variables to Vercel**

**Option A: Using Vercel Dashboard (RECOMMENDED)**

1. **Go to:** https://vercel.com/dashboard
2. **Select:** vineet-parikhs-projects/temprx360
3. **Go to:** Settings → Environment Variables
4. **Add these variables:**

```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: [paste your pk_ key here]
Environment: Production, Preview, Development
```

```
Name: CLERK_SECRET_KEY  
Value: [paste your sk_ key here]
Environment: Production, Preview, Development
```

**Option B: Using Vercel CLI**

Run these commands (replace with your actual keys):

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Paste your pk_ key when prompted
# Select: Production, Preview, Development

vercel env add CLERK_SECRET_KEY
# Paste your sk_ key when prompted  
# Select: Production, Preview, Development
```

### **STEP 3: Redeploy**

After adding the environment variables:

```bash
vercel --prod
```

## 🎯 **EXPECTED RESULT:**

- ✅ Site loads without 500 error
- ✅ Sign-in/Sign-up pages work
- ✅ Authentication flow functions properly

## 📞 **IF YOU NEED HELP:**

1. **Can't find Clerk keys?** Check your Clerk dashboard project settings
2. **Still getting 500 error?** Check Vercel function logs for specific error
3. **Environment variables not working?** Make sure they're added to all environments

**Once you add the Clerk environment variables, the site should work perfectly!** 🚀