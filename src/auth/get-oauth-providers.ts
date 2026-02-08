import {
  type OAuthProvider,
  type OAuthProviderConfig,
  WELL_KNOWN_PROVIDERS
} from './oauth-providers'

/**
 * Public-safe provider information (no sensitive data)
 */
export interface PublicOAuthProvider {
  id: string
  displayName: string
}

// Cache for individual providers
const providerCache = new Map<string, OAuthProviderConfig>()
let publicProvidersCache: PublicOAuthProvider[] | null = null

/**
 * Get the list of configured provider IDs from OAUTH_PROVIDERS env var
 */
function getConfiguredProviderIds(): string[] {
  const providers = process.env.OAUTH_PROVIDERS
  return providers ? providers.split(',').map((p) => p.trim()) : []
}

/**
 * Parse a single OAuth provider configuration from environment variables
 *
 * ⚠️ SECURITY: Extracts CLIENT_SECRET from environment - internal use only
 *
 * @param providerId - The OAuth provider ID
 * @returns Provider config with secrets, or null if not properly configured
 */
function parseSingleProvider(providerId: string): OAuthProviderConfig | null {
  const providerIdLower = providerId.toLowerCase() as OAuthProvider
  const wellKnown = WELL_KNOWN_PROVIDERS[providerIdLower]
  const prefix = `OAUTH_${providerId.toUpperCase()}_`
  const clientId = process.env[`${prefix}CLIENT_ID`]
  const clientSecret = process.env[`${prefix}CLIENT_SECRET`]

  if (!clientId || !clientSecret) {
    return null
  }

  if (!wellKnown) {
    // Custom provider - requires additional env vars
    const authUrl = process.env[`${prefix}AUTHORIZATION_URL`]
    const tokenUrl = process.env[`${prefix}TOKEN_URL`]
    const userInfoUrl = process.env[`${prefix}USERINFO_URL`]
    const scopes = process.env[`${prefix}SCOPES`]?.split(',').map((s) => s.trim()) || [
      'openid',
      'email',
      'profile'
    ]
    const displayName = process.env[`${prefix}DISPLAY_NAME`] || providerId

    if (!authUrl || !tokenUrl || !userInfoUrl) {
      return null
    }

    return {
      id: providerId,
      name: 'custom',
      displayName,
      authorizationUrl: authUrl,
      tokenUrl,
      userInfoUrl,
      scopes,
      clientId,
      clientSecret
    }
  }

  // Well-known provider
  return {
    id: providerId,
    ...wellKnown,
    clientId,
    clientSecret
  }
}

/**
 * Get public-safe OAuth provider information (no sensitive data like client secrets)
 * Use this for client-facing code like login pages
 */
export function getPublicOAuthProviders(): PublicOAuthProvider[] {
  if (publicProvidersCache === null) {
    const providerIds = getConfiguredProviderIds()
    publicProvidersCache = []

    for (const providerId of providerIds) {
      const provider = parseSingleProvider(providerId)
      if (provider) {
        publicProvidersCache.push({
          id: provider.id,
          displayName: provider.displayName
        })
      }
    }
  }

  return publicProvidersCache
}

/**
 * Get a specific OAuth provider by ID
 *
 * ⚠️ SECURITY WARNING: Returns full config including CLIENT_SECRET
 * - ONLY use in API routes and server components
 * - NEVER expose to client-side code
 * - NEVER log the returned object
 *
 * @param providerId - The OAuth provider ID
 * @returns Provider config with secrets, or undefined if not found/configured
 */
export function getOAuthProvider(providerId: string): OAuthProviderConfig | undefined {
  // Check cache first
  if (providerCache.has(providerId)) {
    return providerCache.get(providerId)
  }

  // Parse and cache
  const provider = parseSingleProvider(providerId)
  if (provider) {
    providerCache.set(providerId, provider)
  }

  return provider || undefined
}
