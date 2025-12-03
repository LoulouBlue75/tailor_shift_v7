# Authentication Configuration Guide - Tailor Shift V7

This guide walks you through configuring all credentials and URLs across Supabase, Vercel, Google Cloud Console, and LinkedIn Developer Portal to ensure authentication works correctly.

---

## Table of Contents

1. [Environment Variables Overview](#1-environment-variables-overview)
2. [Step 1: Supabase Configuration](#step-1-supabase-configuration)
3. [Step 2: Vercel Configuration](#step-2-vercel-configuration)
4. [Step 3: Google OAuth Configuration](#step-3-google-oauth-configuration)
5. [Step 4: LinkedIn OAuth Configuration](#step-4-linkedin-oauth-configuration)
6. [Step 5: Final Verification Checklist](#step-5-final-verification-checklist)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## 1. Environment Variables Overview

Your application requires the following environment variables:

| Variable | Required | Where Used | Description |
|----------|----------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Client & Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Client & Server | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Server only | Supabase service role key (admin) |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ Recommended | Client & Server | Your production domain URL |

### Example `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (set this to your production domain)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Step 1: Supabase Configuration

### 1.1 Get Your API Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Navigate to **Settings** → **API**
4. Copy the following values:

| Supabase Label | Environment Variable |
|----------------|---------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **IMPORTANT**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It should only be used in server-side code.

### 1.2 Configure Site URL in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set the **Site URL**:
   - For production: `https://your-domain.com`
   - For development: `http://localhost:3000`

### 1.3 Configure Redirect URLs

In the same **URL Configuration** section, add all allowed redirect URLs:

```
# Development
http://localhost:3000/auth/callback
http://localhost:3000/auth/complete-signup

# Vercel Preview Deployments (use wildcard)
https://*-your-vercel-username.vercel.app/auth/callback
https://*-your-vercel-username.vercel.app/auth/complete-signup

# Production
https://your-domain.com/auth/callback
https://your-domain.com/auth/complete-signup
```

**How to add:**
1. Click on the **Redirect URLs** section
2. Add each URL individually
3. Click **Save**

### 1.4 Enable Email Provider

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email settings:
   - ✅ Enable email confirmations (optional for testing, recommended for production)
   - Set the confirmation email template if needed

### 1.5 Enable Google Provider

1. Go to **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. You'll see fields for:
   - Client ID (from Google Cloud Console - Step 3)
   - Client Secret (from Google Cloud Console - Step 3)
4. **Before saving**, note the **Callback URL** shown:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   You'll need this for Google Cloud Console.

### 1.6 Enable LinkedIn Provider

1. Go to **Authentication** → **Providers**
2. Find **LinkedIn (OIDC)** and toggle it ON
3. You'll see fields for:
   - Client ID (from LinkedIn Developer Portal - Step 4)
   - Client Secret (from LinkedIn Developer Portal - Step 4)
4. **Before saving**, note the **Callback URL** shown:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   You'll need this for LinkedIn Developer Portal.

---

## Step 2: Vercel Configuration

### 2.1 Add Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | **Production ONLY** |

⚠️ **Important**: Only set `NEXT_PUBLIC_SITE_URL` for the Production environment. For Preview deployments, the app will automatically use `VERCEL_URL`.

### 2.2 Verify Automatic Variables

Vercel automatically provides these variables (no action needed):
- `VERCEL_URL` - The deployment URL (e.g., `your-project-abc123.vercel.app`)
- `VERCEL_ENV` - The environment (`production`, `preview`, or `development`)

### 2.3 Redeploy After Changes

After adding/modifying environment variables:
1. Go to the **Deployments** tab
2. Click on the most recent deployment
3. Click the **...** menu → **Redeploy**
4. Choose "Redeploy with existing Build Cache" for speed, or without for a clean build

---

## Step 3: Google OAuth Configuration

### 3.1 Create a Google Cloud Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **New Project**
4. Name it (e.g., "Tailor Shift Auth")
5. Click **Create**

### 3.2 Enable OAuth Consent Screen

1. In Google Cloud Console, search for "OAuth consent screen" or go to:
   **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Tailor Shift
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Add `email` and `profile` scopes (usually `.../auth/userinfo.email` and `.../auth/userinfo.profile`)
   - Click **Update** then **Save and Continue**
7. **Test users**: Add any test users during development
8. Click **Save and Continue**

### 3.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it (e.g., "Tailor Shift Web")
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
6. Add **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (This is the Supabase callback URL from Step 1.5)
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 3.4 Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste the **Client ID**
3. Paste the **Client Secret**
4. Click **Save**

---

## Step 4: LinkedIn OAuth Configuration

### 4.1 Create a LinkedIn App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in the details:
   - **App name**: Tailor Shift
   - **LinkedIn Page**: Select or create a company page
   - **Privacy policy URL**: `https://your-domain.com/privacy`
   - **App logo**: Upload a logo
4. Check the agreement box and click **Create app**

### 4.2 Configure Auth Tab

1. In your app, go to the **Auth** tab
2. Find **OAuth 2.0 settings**
3. Add **Authorized redirect URLs for your app**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (This is the Supabase callback URL from Step 1.6)
4. Note the **Client ID** and **Client Secret** (you may need to click "Generate" for a new secret)

### 4.3 Request Products/Permissions

1. Go to the **Products** tab
2. Request access to:
   - **Sign In with LinkedIn using OpenID Connect** (Required)
   - This gives you access to `openid`, `profile`, and `email` scopes
3. Wait for approval (usually instant for Sign In with LinkedIn)

### 4.4 Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **LinkedIn (OIDC)**
2. Paste the **Client ID**
3. Paste the **Client Secret**
4. Click **Save**

---

## Step 5: Final Verification Checklist

Use this checklist to verify everything is configured correctly:

### Supabase Checklist

- [ ] Project URL is correct in environment variables
- [ ] Anon key is correct in environment variables
- [ ] Service role key is correct in environment variables (server-side only)
- [ ] Site URL is set to your production domain
- [ ] Redirect URLs include:
  - [ ] `http://localhost:3000/auth/callback` (development)
  - [ ] `https://your-domain.com/auth/callback` (production)
  - [ ] `https://your-domain.com/auth/complete-signup` (production)
  - [ ] Vercel preview URLs if needed
- [ ] Email provider is enabled
- [ ] Google provider is enabled with correct credentials
- [ ] LinkedIn (OIDC) provider is enabled with correct credentials

### Vercel Checklist

- [ ] All environment variables are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL` (production only)
- [ ] Deployment restarted after adding variables

### Google Cloud Console Checklist

- [ ] OAuth consent screen is configured
- [ ] OAuth consent screen is published (or has test users added)
- [ ] OAuth credentials created
- [ ] Authorized redirect URI includes Supabase callback URL
- [ ] Client ID and Secret are in Supabase

### LinkedIn Developer Portal Checklist

- [ ] App created
- [ ] "Sign In with LinkedIn using OpenID Connect" product requested
- [ ] Redirect URL includes Supabase callback URL
- [ ] Client ID and Secret are in Supabase

---

## Troubleshooting Common Issues

### Issue: "OAuth error - Invalid redirect URI"

**Cause**: The redirect URI doesn't match exactly what's configured.

**Solution**:
1. Check the exact error message for the URI being used
2. Add that exact URI to:
   - Google Cloud Console → Credentials → Authorized redirect URIs
   - OR LinkedIn Dev → Auth → Authorized redirect URLs
3. Ensure no trailing slashes mismatch

### Issue: "supabase_auth_callback" error or blank page

**Cause**: The redirect URL isn't in Supabase's allowed list.

**Solution**:
1. Go to Supabase → Authentication → URL Configuration
2. Add the exact callback URL being used
3. Save and retry

### Issue: Users always created as "talent" type

**Cause**: `user_type` not passed during sign-up.

**Solution**: This was fixed in the code changes. Ensure you've deployed the latest version with the updated `app/signup/page.tsx`.

### Issue: OAuth login works but redirects to wrong dashboard

**Cause**: Middleware doesn't know the user type.

**Solution**: This was fixed in `lib/supabase/middleware.ts`. Ensure you've deployed the latest version.

### Issue: Password reset email links don't work

**Cause**: Missing `/reset-password` page or incorrect redirect URL.

**Solution**: This was fixed by creating `app/reset-password/page.tsx`. Ensure it's deployed.

### Issue: "access_denied" from LinkedIn

**Cause**: 
1. App not verified
2. Missing OpenID Connect product
3. Incorrect scopes

**Solution**:
1. Ensure "Sign In with LinkedIn using OpenID Connect" is approved in Products
2. Verify redirect URLs match exactly
3. Check that the app isn't restricted

### Issue: Preview deployments don't work

**Cause**: Preview URLs not in whitelist.

**Solution**:
1. Add wildcard or specific preview URLs to Supabase redirect URLs
2. For Vercel, preview URLs follow the pattern:
   `https://your-project-HASH-your-username.vercel.app`
3. You can also use wildcards in some places: `https://*.vercel.app` (check if Supabase supports this)

---

## Quick Reference: All URLs to Configure

### In Supabase (Authentication → URL Configuration)

**Site URL:**
```
https://your-domain.com
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/complete-signup
https://your-domain.com/auth/callback
https://your-domain.com/auth/complete-signup
```

### In Google Cloud Console (Credentials → OAuth Client)

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-domain.com
```

**Authorized redirect URIs:**
```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
```

### In LinkedIn Developer Portal (Auth Tab)

**Authorized redirect URLs:**
```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
```

---

## Need Help?

If you're still having issues after following this guide:

1. Check your browser's Network tab for the exact error response
2. Check Supabase Dashboard → Authentication → Users to see if users are being created
3. Check Supabase Dashboard → Logs for any auth-related errors
4. Verify environment variables are loaded by logging them (don't log secrets!)

---

*Last updated: December 2024*