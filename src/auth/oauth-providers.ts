/**
 * OAuth provider configuration and types
 *
 * ⚠️ SECURITY NOTE:
 * - OAuthProviderConfig contains clientSecret - NEVER expose to client-side
 * - Use PublicOAuthProvider type for client-safe data
 * - Always use getPublicOAuthProviders() for client-facing code
 */

export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'custom'

/**
 * Full OAuth provider configuration including secrets
 *
 * ⚠️ CONTAINS SECRETS - Server-side only!
 */
export interface OAuthProviderConfig {
  id: string
  name: string
  displayName: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string // ⚠️ SECRET - Never expose to client
  userInfoPath?: string // JSON path to extract email and name from user info response
}

/**
 * Well-known OAuth provider configurations
 */
export const WELL_KNOWN_PROVIDERS: Record<
  OAuthProvider,
  Omit<OAuthProviderConfig, 'clientId' | 'clientSecret' | 'id'>
> = {
  google: {
    name: 'Google',
    displayName: 'Google',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
    userInfoPath: undefined // Uses email and name directly
  },
  github: {
    name: 'GitHub',
    displayName: 'GitHub',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['user:email'],
    userInfoPath: undefined // Uses email and name directly, but email might be in separate endpoint
  },
  microsoft: {
    name: 'Microsoft',
    displayName: 'Microsoft',
    authorizationUrl:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile'],
    userInfoPath: undefined // Uses mail and displayName
  },
  custom: {
    name: 'Custom',
    displayName: 'Custom',
    authorizationUrl: '', // Must be provided via env
    tokenUrl: '', // Must be provided via env
    userInfoUrl: '', // Must be provided via env
    scopes: ['openid', 'email', 'profile'],
    userInfoPath: undefined
  }
}

/**
 * Extract user email and name from OAuth provider response
 */
export async function extractUserInfo(
  provider: OAuthProviderConfig,
  accessToken: string
): Promise<{ email: string; name: string }> {
  const userResponse = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  })

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch user info: ${userResponse.statusText}`)
  }

  const userData = (await userResponse.json()) as Record<string, unknown>

  // Handle GitHub special case - email might be null, need to fetch from emails endpoint
  if (
    provider.id === 'github' &&
    (!userData.email || userData.email === null)
  ) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })

    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as Array<{
        email: string
        primary: boolean
        verified: boolean
      }>
      const primaryEmail =
        emails.find((e) => e.primary && e.verified) ||
        emails.find((e) => e.verified) ||
        emails[0]
      if (primaryEmail) {
        userData.email = primaryEmail.email
      }
    }
  }

  // Handle Microsoft special case - uses 'mail' instead of 'email'
  if (provider.id === 'microsoft') {
    return {
      email: (userData.mail ||
        userData.userPrincipalName ||
        userData.email) as string,
      name: (userData.displayName || userData.name || '') as string
    }
  }

  return {
    email: (userData.email || '') as string,
    name: (userData.name || userData.displayName || '') as string
  }
}
