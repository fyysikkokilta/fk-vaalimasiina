# OAuth Setup Guide

The voting machine uses OAuth 2.0 for admin authentication. You can enable one or more providers simultaneously.

## Configuration Overview

Set the `OAUTH_PROVIDERS` environment variable to a comma-separated list of provider IDs:

```env
OAUTH_PROVIDERS="google"           # Single provider
OAUTH_PROVIDERS="google,github"    # Multiple providers
```

For each provider in the list, set the corresponding client ID and secret (see provider-specific sections below).

---

## Google OAuth

### Setup Steps

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.

2. Navigate to **APIs & Services → OAuth consent screen**.
   - Choose **External** user type (or Internal if using Google Workspace)
   - Fill in the app name, user support email, and developer contact
   - Add scope: `email`, `profile`, `openid`

3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Add Authorized redirect URI: `https://your-domain.com/api/auth/google/callback`
   - (For local dev also add: `http://localhost:3000/api/auth/google/callback`)

4. Copy the **Client ID** and **Client Secret**.

### Environment Variables

```env
OAUTH_PROVIDERS="google"
OAUTH_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
OAUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## GitHub OAuth

### Setup Steps

1. Go to **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**.

2. Fill in:
   - **Application name:** Your voting system name
   - **Homepage URL:** `https://your-domain.com`
   - **Authorization callback URL:** `https://your-domain.com/api/auth/github/callback`

3. Click **Register application**, then **Generate a new client secret**.

### Environment Variables

```env
OAUTH_PROVIDERS="github"
OAUTH_GITHUB_CLIENT_ID="your-github-client-id"
OAUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
```

> **Note:** GitHub may hide a user's email address. The system automatically fetches email from the GitHub `/user/emails` endpoint if needed.

---

## Microsoft OAuth (Azure Active Directory)

### Setup Steps

1. Go to the [Azure Portal](https://portal.azure.com/) → **Azure Active Directory → App registrations → New registration**.

2. Fill in:
   - **Name:** Your voting system name
   - **Supported account types:** Choose based on your needs (single tenant for org-only, multi-tenant for all Microsoft accounts)
   - **Redirect URI (Web):** `https://your-domain.com/api/auth/microsoft/callback`

3. After creating, go to **Certificates & secrets → New client secret**. Copy the **Value** (not the ID).

4. Copy the **Application (client) ID** from the Overview page.

### Environment Variables

```env
OAUTH_PROVIDERS="microsoft"
OAUTH_MICROSOFT_CLIENT_ID="your-azure-application-id"
OAUTH_MICROSOFT_CLIENT_SECRET="your-azure-client-secret-value"
```

> **Note:** Microsoft returns `mail` or `userPrincipalName` as the email field — the system handles this automatically.

---

## Custom OAuth Provider

Any OAuth 2.0 provider that exposes a userinfo endpoint returning `email` and `name` fields can be configured as a custom provider.

### Required Environment Variables

Replace `MYPROVIDER` with a unique uppercase identifier for your provider:

```env
OAUTH_PROVIDERS="myprovider"
OAUTH_MYPROVIDER_CLIENT_ID="your-client-id"
OAUTH_MYPROVIDER_CLIENT_SECRET="your-client-secret"
OAUTH_MYPROVIDER_AUTHORIZATION_URL="https://sso.example.com/oauth/authorize"
OAUTH_MYPROVIDER_TOKEN_URL="https://sso.example.com/oauth/token"
OAUTH_MYPROVIDER_USERINFO_URL="https://sso.example.com/oauth/userinfo"
```

### Optional Variables

```env
OAUTH_MYPROVIDER_SCOPES="openid,email,profile"   # default: openid,email,profile
OAUTH_MYPROVIDER_DISPLAY_NAME="My SSO"           # default: the provider ID
```

The login page will show a button labeled with `DISPLAY_NAME`.

---

## Using Multiple Providers

```env
OAUTH_PROVIDERS="google,microsoft"
OAUTH_GOOGLE_CLIENT_ID="..."
OAUTH_GOOGLE_CLIENT_SECRET="..."
OAUTH_MICROSOFT_CLIENT_ID="..."
OAUTH_MICROSOFT_CLIENT_SECRET="..."
```

All configured providers will appear as separate login buttons on the admin login page.

---

## Admin Access Control

Authentication only verifies identity. Admin access is controlled separately by the `ADMIN_EMAILS` variable:

```env
ADMIN_EMAILS="chair@example.com,secretary@example.com"
```

Only users whose authenticated email appears in this list can access the admin panel, regardless of which OAuth provider they used.

---

## Callback URL Pattern

All providers follow this callback URL pattern:

```
https://your-domain.com/api/auth/<provider-id>/callback
```

For example:

- Google: `.../api/auth/google/callback`
- GitHub: `.../api/auth/github/callback`
- Custom (id `myprovider`): `.../api/auth/myprovider/callback`

The provider ID in the callback URL is the **lowercase** version of the ID used in `OAUTH_PROVIDERS`.
