# 📧 Email Setup Guide for TempRx360

## 🎯 Overview

This guide will help you set up email functionality for:
- ✅ Password reset emails
- ✅ Email verification
- ✅ Monthly temperature reports
- ✅ Alert notifications

## 🚀 Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process to enable 2FA

### Step 2: Create App Password

1. In Google Account Settings, go to **Security**
2. Under **2-Step Verification**, click **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Enter "TempRx360" as the app name
5. **Copy the 16-character password** (you'll need this)

### Step 3: Add Environment Variables

Add these to your Vercel environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=TempRx360 <your-email@gmail.com>
```

## 🔧 Vercel Environment Variables Setup

### Option 1: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **temprx360** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| **Name** | **Value** | **Environment** |
|----------|-----------|-----------------|
| `SMTP_HOST` | `smtp.gmail.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_SECURE` | `false` | Production |
| `SMTP_USER` | `your-email@gmail.com` | Production |
| `SMTP_PASS` | `your-app-password` | Production |
| `SMTP_FROM` | `TempRx360 <your-email@gmail.com>` | Production |

### Option 2: Vercel CLI

```bash
vercel env add SMTP_HOST
# Enter: smtp.gmail.com

vercel env add SMTP_PORT
# Enter: 587

vercel env add SMTP_SECURE
# Enter: false

vercel env add SMTP_USER
# Enter: your-email@gmail.com

vercel env add SMTP_PASS
# Enter: your-16-character-app-password

vercel env add SMTP_FROM
# Enter: TempRx360 <your-email@gmail.com>
```

## 🧪 Testing Email Configuration

### Method 1: Test Page

1. Visit: `https://temprx360.vercel.app/test-email`
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox

### Method 2: API Test

```bash
curl -X POST https://temprx360.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

## 📋 Alternative Email Providers

### Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-app-password
SMTP_FROM=TempRx360 <your-email@outlook.com>
```

### SendGrid (Professional)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=TempRx360 <noreply@yourdomain.com>
```

### Resend (Modern)

```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
SMTP_FROM=TempRx360 <noreply@yourdomain.com>
```

## 🔍 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Make sure 2FA is enabled
   - Use App Password, not regular password
   - Check username is correct

2. **"Connection timeout"**
   - Verify SMTP_HOST and SMTP_PORT
   - Check firewall settings

3. **"Invalid sender"**
   - Make sure SMTP_FROM matches SMTP_USER domain
   - Use proper email format: `Name <email@domain.com>`

### Debug Steps

1. Check configuration:
   ```bash
   curl https://temprx360.vercel.app/api/test-email
   ```

2. Check Vercel logs:
   ```bash
   vercel logs --follow
   ```

3. Test locally:
   ```bash
   npm run dev
   # Visit http://localhost:3000/test-email
   ```

## 🎉 Features Enabled After Setup

### Password Reset
- Users can reset passwords via email
- Secure token-based reset links
- 1-hour expiration for security

### Email Verification
- New user email verification
- Account activation emails
- Welcome messages

### Automated Reports
- Monthly temperature reports
- PDF attachments
- Professional email templates

### Alert Notifications
- Temperature excursion alerts
- System status notifications
- Maintenance reminders

## 🔐 Security Best Practices

1. **Use App Passwords** - Never use your main email password
2. **Rotate Credentials** - Change app passwords periodically
3. **Monitor Usage** - Check email sending logs
4. **Limit Scope** - Use dedicated email for system notifications

## 📞 Support

If you need help with email setup:

1. **Test Page**: `https://temprx360.vercel.app/test-email`
2. **API Docs**: Check `/api/test-email` endpoint
3. **Logs**: Monitor Vercel function logs
4. **Gmail Help**: [Google App Passwords Guide](https://support.google.com/accounts/answer/185833)

---

## ✅ Quick Checklist

- [ ] Enable 2FA on Gmail account
- [ ] Create App Password for TempRx360
- [ ] Add all 6 environment variables to Vercel
- [ ] Deploy application to apply changes
- [ ] Test email using `/test-email` page
- [ ] Verify password reset functionality
- [ ] Check email templates and formatting

**Once complete, your TempRx360 system will have full email functionality! 🎉**