import { NextResponse } from 'next/server'

import { env } from '~/env'
import { setTestEmailFailure } from '~/emails/testCapture'

export async function POST(req: Request) {
  if (env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fail = (body as { fail?: unknown }).fail
  if (typeof fail !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid "fail" boolean' }, { status: 400 })
  }

  setTestEmailFailure(fail)
  return new NextResponse(null, { status: 204 })
}
