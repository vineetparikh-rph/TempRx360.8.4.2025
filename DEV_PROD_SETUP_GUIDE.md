# 🚀 Development vs Production Environment Setup

## 🎯 Overview

This guide sets up separate development and production environments to protect your live system while allowing safe development.

## 🏗️ Environment Structure

### **Production Environment**
- **Branch:** `main`
- **URL:** `https://temprx360.vercel.app`
- **Database:** Neon Production DB
- **Status:** ✅ **PROTECTED - Live System**

### **Development Environment**
- **Branch:** `dev` (to be created)
- **URL:** `https://temprx360-git-dev-vineet-parikhs-projects.vercel.app`
- **Database:** Neon Development DB (separate)
- **Status:** 🔧 **Safe for Testing**

## 📋 Setup Steps

### Step 1: Create Development Database

1. **Go to Neon Console:** [https://console.neon.tech](https://console.neon.tech)
2. **Create New Database:**
   - Project: Same project as production
   - Database Name: `neondb_dev`
   - Purpose: Development/Testing

3. **Get Development Connection String:**
   ```
   postgresql://neondb_owner:PASSWORD@ENDPOINT/neondb_dev?sslmode=require
   ```

### Step 2: Set Up Git Branches

```bash
# Create and switch to development branch
git checkout -b dev

# Push development branch to GitHub
git push -u origin dev
```

### Step 3: Configure Vercel Branch Deployments

1. **Go to Vercel Dashboard**
2. **Select temprx360 project**
3. **Settings → Git**
4. **Configure Branch Deployments:**
   - `main` → Production
   - `dev` → Preview (Development)

### Step 4: Add Development Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

| **Variable** | **Value** | **Environment** |
|--------------|-----------|-----------------|
| `DATABASE_URL` | `postgresql://...neondb_dev...` | Preview (dev) |
| `NEXTAUTH_SECRET` | `dev-secret-key-different-from-prod` | Preview (dev) |
| `NEXTAUTH_URL` | `https://temprx360-git-dev-vineet-parikhs-projects.vercel.app` | Preview (dev) |
| `NODE_ENV` | `development` | Preview (dev) |

## 🔧 Development Workflow

### **Making Changes Safely:**

1. **Switch to Development Branch:**
   ```bash
   git checkout dev
   ```

2. **Make Your Changes:**
   ```bash
   # Edit files
   git add .
   git commit -m "Add new feature"
   git push origin dev
   ```

3. **Test on Development URL:**
   - Visit: `https://temprx360-git-dev-vineet-parikhs-projects.vercel.app`
   - Test all functionality
   - Verify changes work correctly

4. **Deploy to Production (When Ready):**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

### **Local Development:**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit: http://localhost:3000
```

## 🗄️ Database Management

### **Development Database:**
- **Purpose:** Safe testing, experiments
- **Data:** Test users, sample data
- **Changes:** Can be reset/modified freely

### **Production Database:**
- **Purpose:** Live system
- **Data:** Real user accounts, actual data
- **Changes:** Only via tested migrations

### **Database Seeding for Development:**

```bash
# Reset development database
npm run db:reset

# Seed with test data
npm run db:seed
```

## 🧪 Testing Strategy

### **Development Testing:**
1. Test new features on dev branch
2. Verify email functionality (mock mode)
3. Test user authentication
4. Validate database changes

### **Production Deployment:**
1. Only deploy tested features
2. Use database migrations
3. Monitor for issues
4. Have rollback plan ready

## 🔐 Security Considerations

### **Environment Separation:**
- **✅ Different databases** - No cross-contamination
- **✅ Different secrets** - Separate auth keys
- **✅ Different URLs** - Clear environment distinction
- **✅ Different email configs** - Prevent accidental sends

### **Access Control:**
- **Production:** Only stable, tested code
- **Development:** Experimental features, testing
- **Local:** Personal development environment

## 📊 Environment Variables Summary

### **Production (.env.production):**
```bash
DATABASE_URL=postgresql://...neondb...
NEXTAUTH_SECRET=production-secret-key
NEXTAUTH_URL=https://temprx360.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_USER=production-email@gmail.com
```

### **Development (.env.development):**
```bash
DATABASE_URL=postgresql://...neondb_dev...
NEXTAUTH_SECRET=dev-secret-key
NEXTAUTH_URL=http://localhost:3000
# SMTP disabled (mock mode)
```

### **Local (.env.local):**
```bash
DATABASE_URL=postgresql://...neondb_dev...
NEXTAUTH_SECRET=local-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Quick Commands

### **Switch to Development:**
```bash
git checkout dev
npm run dev
# Visit: http://localhost:3000
```

### **Deploy to Development:**
```bash
git checkout dev
git add .
git commit -m "Test new feature"
git push origin dev
# Auto-deploys to: https://temprx360-git-dev-...vercel.app
```

### **Deploy to Production:**
```bash
git checkout main
git merge dev
git push origin main
# Auto-deploys to: https://temprx360.vercel.app
```

## 🎯 Benefits

### **Safety:**
- **✅ Protected Production** - No accidental changes
- **✅ Safe Testing** - Experiment without risk
- **✅ Easy Rollback** - Revert if needed

### **Efficiency:**
- **✅ Parallel Development** - Multiple features
- **✅ Continuous Testing** - Always have working dev
- **✅ Staged Deployment** - Test before production

### **Professional:**
- **✅ Industry Standard** - Git flow best practices
- **✅ Team Ready** - Multiple developers can work
- **✅ CI/CD Pipeline** - Automated deployments

## 🎉 Current Status

### **Production (Protected):**
- **✅ URL:** https://temprx360.vercel.app
- **✅ Database:** Neon Production
- **✅ Users:** 9 working accounts
- **✅ Status:** Stable, working perfectly

### **Development (Ready to Create):**
- **🔧 Branch:** `dev` (to be created)
- **🔧 Database:** Neon Dev (to be created)
- **🔧 URL:** Auto-generated by Vercel
- **🔧 Status:** Ready for safe development

**Your production system is now protected while enabling safe development! 🛡️**