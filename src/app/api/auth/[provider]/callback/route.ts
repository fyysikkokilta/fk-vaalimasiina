import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getOAuthProvider } from '~/auth/get-oauth-providers'
import { extractUserInfo } from '~/auth/oauth-providers'
import { env } from '~/env'
import { redirect } from '~/i18n/navigation'
import { routing } from '~/i18n/routing'
import { JWT_COOKIE } from '~/utils/isAuthorized'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerId } = await params
  const provider = getOAuthProvider(providerId)

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value ||
    routing.defaultLocale) as 'en' | 'fi'
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code') || ''
  const error = searchParams.get('error')

  if (error) {
    redirect({ href: '/login?error=access_denied', locale })
  }

  if (!code) {
    redirect({ href: '/login?error=no_code', locale })
  }

  try {
    // Exchange code for access token
    const tokenBody = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/${providerId}/callback`
    })

    // GitHub uses different content type
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    }

    const tokenResponse = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers,
      body: tokenBody.toString()
    })

    if (!tokenResponse.ok) {
      // Only log status code, never log response body as it may contain sensitive data
      console.error('Token exchange failed with status:', tokenResponse.status)
      redirect({ href: '/login?error=server_error', locale })
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string
      token_type?: string
    }

    if (!tokenData.access_token) {
      redirect({ href: '/login?error=server_error', locale })
    }

    // Get user info from OAuth provider
    const user = await extractUserInfo(provider, tokenData.access_token)

    if (!user.email) {
      redirect({ href: '/login?error=unauthorized', locale })
    }

    // Check if user is authorized (email is in admin emails list)
    if (!env.ADMIN_EMAILS.includes(user.email)) {
      redirect({ href: '/login?error=unauthorized', locale })
    }

    // Create JWT token
    const jwt = await new SignJWT({ user })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('fk-vaalimasiina')
      .setExpirationTime('8h')
      .sign(new TextEncoder().encode(env.AUTH_SECRET))

    // Set cookie and redirect to admin page
    cookieStore.set(JWT_COOKIE, jwt, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8
    })

    redirect({ href: '/admin', locale })
  } catch (error) {
    // Log error type only, never log full error as it may contain tokens/secrets
    console.error(
      'OAuth callback error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    redirect({ href: '/login?error=server_error', locale })
  }
}
