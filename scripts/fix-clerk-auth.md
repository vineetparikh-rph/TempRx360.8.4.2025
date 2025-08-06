# 🔧 Fix Clerk Authentication - Replace useSession with useUser

## 🎯 **ISSUE:**
Multiple files are still using NextAuth's `useSession` instead of Clerk's `useUser`, causing client-side errors.

## 📋 **FILES TO UPDATE:**

### **Pattern to Replace:**
```typescript
// OLD (NextAuth)
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();

// NEW (Clerk)
import { useUser } from '@clerk/nextjs';
const { user, isLoaded } = useUser();
```

### **Files Found with useSession:**
1. `src/layout/AppSidebar.tsx`
2. `src/app/(admin)/user-info/page.tsx`
3. `src/components/pharmacy/pharmacytemperaturedashboard.tsx`
4. `src/app/(admin)/sensors/status/page.tsx`
5. `src/app/(admin)/sensors/page.tsx`
6. `src/app/(admin)/reports/page.tsx`
7. `src/app/(admin)/reports/logs/page.tsx`
8. `src/app/(admin)/reports/export/page.tsx`
9. `src/app/(admin)/reports/daily/page.tsx`
10. `src/app/(admin)/reports/compliance/page.tsx`
11. And many more...

## 🔄 **REPLACEMENT RULES:**

### **Import Statement:**
```typescript
// Replace this:
import { useSession } from 'next-auth/react';

// With this:
import { useUser } from '@clerk/nextjs';
```

### **Hook Usage:**
```typescript
// Replace this:
const { data: session, status } = useSession();

// With this:
const { user, isLoaded } = useUser();
```

### **Loading Check:**
```typescript
// Replace this:
if (status === "loading") return <div>Loading...</div>;

// With this:
if (!isLoaded) return <div>Loading...</div>;
```

### **Authentication Check:**
```typescript
// Replace this:
if (!session) {
  window.location.href = '/signin';
  return;
}

// With this:
if (!user) {
  window.location.href = '/sign-in';
  return;
}
```

### **User Data Access:**
```typescript
// Replace this:
session.user.email
session.user.name
session.user.role

// With this:
user.emailAddresses[0]?.emailAddress
user.fullName
user.publicMetadata.role
```

## 🚀 **NEXT STEPS:**

1. **Fix main files first** (AppSidebar, main pages)
2. **Test each fix** by deploying
3. **Update remaining files** systematically
4. **Verify all authentication flows** work

## 📝 **NOTES:**

- Clerk uses different property names for user data
- Authentication redirects should go to `/sign-in` not `/signin`
- Loading states use `isLoaded` instead of `status`
- User roles are stored in `publicMetadata` not directly on user object

**Once all files are updated, the application should work perfectly with Clerk authentication!** 🎉