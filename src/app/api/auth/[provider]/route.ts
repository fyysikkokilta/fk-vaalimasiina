import { NextResponse } from 'next/server'

import { getOAuthProvider } from '~/auth/get-oauth-providers'
import { env } from '~/env'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerId } = await params
  const provider = getOAuthProvider(providerId)

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  // Build OAuth authorization URL
  const authUrl = new URL(provider.authorizationUrl)
  authUrl.searchParams.set('client_id', provider.clientId)
  authUrl.searchParams.set(
    'redirect_uri',
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/${providerId}/callback`
  )
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', provider.scopes.join(' '))

  // Some providers need additional parameters
  if (provider.id === 'google') {
    authUrl.searchParams.set('access_type', 'offline')
  }

  // Redirect to OAuth provider
  return NextResponse.redirect(authUrl.toString())
}
