import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { env } from '~/env'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=access_denied', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${env.BASE_URL}/api/auth/google`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse
    const accessToken = tokenData.access_token

    // Get user info from Google
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const userData = (await userResponse.json()) as GoogleUserInfo
    const userEmail = userData.email

    // Check if user is authorized (email is in admin emails list)
    if (!env.ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Create JWT token
    const jwt = await new SignJWT({ email: userEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('fk-vaalimasiina')
      .setExpirationTime('10h')
      .sign(new TextEncoder().encode(env.AUTH_SECRET))

    // Set cookie and redirect to admin
    const cookieStore = await cookies()
    cookieStore.set('admin-token', jwt, {
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      httpOnly: true
    })

    return NextResponse.redirect(new URL('/admin', request.url))
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}
