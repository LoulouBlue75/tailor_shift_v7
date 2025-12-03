# 🎯 Action Plan: Tailor Shift Authentication Setup

**Domain**: `tailorshift.co`  
**Supabase Project ID**: `bwirxsgxkkouabetqcns`  
**Status**: Review completed, awaiting action

---

## 🔴 CRITICAL: Fix Environment Variable Name

Your `.env.local` uses `NEXT_PUBLIC_APP_URL` but the code expects `NEXT_PUBLIC_SITE_URL`.

### Action Required:
Edit your `.env.local` and change line 7:

**Before:**
```env
NEXT_PUBLIC_APP_URL=https://www.tailorshift.co
```

**After:**
```env
NEXT_PUBLIC_SITE_URL=https://www.tailorshift.co
```

You can keep `NEXT_PUBLIC_APP_URL` if other parts of your code use it, but you MUST add `NEXT_PUBLIC_SITE_URL`.

---

## 🔴 CRITICAL: Verify Supabase Service Role Key

Your current `SUPABASE_SERVICE_ROLE_KEY` looks incorrect:
```
sb_secret_yBlv9owBA7zk0w-9lPXxcA_kyC_6ZYf
```

A Supabase service role key should be a long JWT starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Action Required:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/bwirxsgxkkouabetqcns/settings/api)
2. Scroll to **Project API keys**
3. Find `service_role` `secret` key
4. Copy it (it's hidden by default, click to reveal)
5. Replace in `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ACTUAL_LONG_KEY
   ```

⚠️ The key you have (`sb_secret_...`) might be a Supabase CLI token or something else - it won't work for the app.

---

## 🟡 OVH DNS Configuration for www.tailorshift.co

Vercel is asking you to add a CNAME record for `www`.

### Action Required:
1. Go to [OVH Manager](https://www.ovh.com/manager/)
2. Navigate to your domain `tailorshift.co`
3. Go to **DNS Zone** tab
4. Click **Add an entry**
5. Configure as follows:

| Field | Value |
|-------|-------|
| Type | CNAME |
| Subdomain | www |
| Target | `435cb92ac3952795.vercel-dns-016.com.` |
| TTL | 3600 (or default) |

6. Click **Confirm**
7. Wait 5-30 minutes for propagation
8. Go back to Vercel and click **Verify** or refresh the page

**Note**: If there's already an existing `www` record (like an A record), delete it first before adding the CNAME.

---

## 🟡 Supabase Dashboard Configuration

### 1. Set Site URL and Redirect URLs

Go to: [Supabase Auth URL Config](https://supabase.com/dashboard/project/bwirxsgxkkouabetqcns/auth/url-configuration)

**Site URL:**
```
https://www.tailorshift.co
```

**Redirect URLs** (add all of these):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/complete-signup
https://www.tailorshift.co/auth/callback
https://www.tailorshift.co/auth/complete-signup
https://tailorshift.co/auth/callback
https://tailorshift.co/auth/complete-signup
```

### 2. Configure Google Provider

Go to: [Supabase Auth Providers](https://supabase.com/dashboard/project/bwirxsgxkkouabetqcns/auth/providers)

1. Find **Google** and enable it (if not already)
2. Enter the credentials from your `.env.local`:

| Field | Value |
|-------|-------|
| Client ID | Copy `GOOGLE_CLIENT_ID` from your `.env.local` |
| Client Secret | Copy `GOOGLE_CLIENT_SECRET` from your `.env.local` |

3. Click **Save**

### 3. Configure LinkedIn Provider

Same page, find **LinkedIn (OIDC)** and enable it:

| Field | Value |
|-------|-------|
| Client ID | Copy `LINKEDIN_CLIENT_ID` from your `.env.local` |
| Client Secret | Copy `LINKEDIN_CLIENT_SECRET` from your `.env.local` |

Click **Save**.

---

## 🟡 Google Cloud Console Configuration

Go to: [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

Find your OAuth 2.0 Client ID (`598712279610-n0d59lhcs1nl2n4aqnvtq0vd2u5d0qqh`) and edit it.

### Authorized JavaScript origins:
```
http://localhost:3000
https://www.tailorshift.co
https://tailorshift.co
```

### Authorized redirect URIs:
```
https://bwirxsgxkkouabetqcns.supabase.co/auth/v1/callback
```

Click **Save**.

---

## 🟡 LinkedIn Developer Portal Configuration

Go to: [LinkedIn Developer Apps](https://www.linkedin.com/developers/apps)

Find your app (with Client ID `78kbaqv3ld0d1i`), go to **Auth** tab.

### Authorized redirect URLs:
```
https://bwirxsgxkkouabetqcns.supabase.co/auth/v1/callback
```

### Products:
Make sure **Sign In with LinkedIn using OpenID Connect** is enabled/requested.

---

## 🟢 Vercel Environment Variables

Go to: [Vercel Project Settings](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Ensure these are set for **Production**, **Preview**, and **Development**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bwirxsgxkkouabetqcns.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aXJ4c2d4a2tvdWFiZXRxY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDQxMTAsImV4cCI6MjA4MDEyMDExMH0.i8OfKaprCynO-lt521Mz4Z4MZdER2XMixPA-B6TCScU` |
| `SUPABASE_SERVICE_ROLE_KEY` | (The correct long JWT from Supabase) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.tailorshift.co` (**Production only**) |
| `RESEND_API_KEY` | `re_HpPf9v72_CCRP2gqMhiMr6JF27uUGqXQu` |

After adding/updating, **redeploy** your project.

---

## 📝 About the Database URL

You mentioned:
```
postgresql://postgres:[YOUR_PASSWORD]@db.bwirxsgxkkouabetqcns.supabase.co:5432/postgres
```

This is the **direct database connection string**. It's NOT needed in `.env.local` for the Next.js app because:
- The Supabase client library uses the Project URL + API keys
- Direct database connections are for: migrations, database admin tools, direct SQL scripts

**Where you'd use it:**
- In a Supabase migration tool
- In a database GUI like DBeaver, pgAdmin, TablePlus
- In Prisma or Drizzle if you were using those instead of Supabase client

For now, you can skip adding it to `.env.local` unless you have a specific need.

---

## ✅ Complete Checklist

### Environment Variables (.env.local)
- [ ] Rename `NEXT_PUBLIC_APP_URL` to `NEXT_PUBLIC_SITE_URL`
- [ ] Fix `SUPABASE_SERVICE_ROLE_KEY` with the correct JWT from Supabase

### OVH DNS
- [ ] Add CNAME record: `www` → `435cb92ac3952795.vercel-dns-016.com.`
- [ ] Wait for propagation (5-30 min)
- [ ] Verify in Vercel

### Supabase Dashboard
- [ ] Set Site URL to `https://www.tailorshift.co`
- [ ] Add all redirect URLs (localhost + production)
- [ ] Enable Google provider with your credentials
- [ ] Enable LinkedIn (OIDC) provider with your credentials

### Google Cloud Console
- [ ] Add `https://www.tailorshift.co` to authorized origins
- [ ] Verify `https://bwirxsgxkkouabetqcns.supabase.co/auth/v1/callback` is in redirect URIs

### LinkedIn Developer Portal
- [ ] Verify `https://bwirxsgxkkouabetqcns.supabase.co/auth/v1/callback` is in redirect URLs
- [ ] Ensure "Sign In with LinkedIn using OpenID Connect" is enabled

### Vercel
- [ ] All environment variables set (especially the corrected ones)
- [ ] Redeploy after making changes

---

## 🧪 Testing Plan

After completing all steps:

1. **Test Email Sign-Up**:
   - Go to `https://www.tailorshift.co/signup`
   - Select "Professional" or "Brand"
   - Fill in the form and submit
   - Check if redirected to onboarding

2. **Test Google Sign-Up**:
   - Go to signup, select type, click "Continue with Google"
   - Should redirect to Google, then back to your site
   - Should land on `/auth/complete-signup` then onboarding

3. **Test LinkedIn Sign-Up**:
   - Same flow as Google

4. **Test Login**:
   - Go to `/login`
   - Try email login
   - Try Google login
   - Try LinkedIn login

5. **Test Password Reset**:
   - Go to `/forgot-password`
   - Enter email
   - Check email for reset link
   - Click link, should go to `/reset-password`
   - Set new password

---

*If you get stuck on any step, let me know the specific error or screenshot and I'll help you through it!*