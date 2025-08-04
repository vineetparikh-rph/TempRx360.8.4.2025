# 🚀 Migration to Neon PostgreSQL

## Why Migrate?
- ✅ **Reliable**: PostgreSQL works perfectly in serverless environments
- ✅ **Scalable**: Better performance and concurrent connections
- ✅ **Persistent**: Data persists between deployments
- ✅ **Professional**: Industry standard for production applications

## Step-by-Step Migration

### 1. Get Your Neon Database URL
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new database or use existing one
3. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Update Environment Variables

#### Local Development (.env)
```bash
# Replace the SQLite DATABASE_URL with your Neon URL
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="+K+rSpvxud4GaXlB0nEKE4ro260kQ5PIs2xbpKav3r8="
NEXTAUTH_URL="http://localhost:3000"
```

#### Production (Vercel)
```bash
vercel env add DATABASE_URL
# Paste your Neon PostgreSQL connection string when prompted
```

### 3. Run Database Migration
```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name "migrate_to_postgresql"

# Or push schema directly
npx prisma db push
```

### 4. Setup Production Database
Visit: `/setup-neon-db` to initialize your production database with:
- Admin user (admin@georgiesrx.com / admin123)
- All Georgies pharmacies
- Proper relationships

### 5. Deploy to Production
```bash
git add .
git commit -m "Migrate to Neon PostgreSQL"
git push
vercel --prod
```

## Benefits After Migration
- ✅ No more "Unable to open database file" errors
- ✅ Reliable admin login
- ✅ Data persistence across deployments
- ✅ Better performance and scalability
- ✅ Professional production setup

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Ensure the database exists in Neon
- Check that the connection string includes `?sslmode=require`

### Migration Issues
- Run `npx prisma db push` if migrations fail
- Use `/setup-neon-db` to initialize the database

### Login Issues
- After migration, visit `/setup-neon-db` to ensure admin user exists
- Use credentials: admin@georgiesrx.com / admin123