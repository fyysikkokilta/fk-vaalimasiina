import { NextResponse } from 'next/server'

import { env } from '~/env'
import { clearTestEmails, getTestEmails } from '~/emails/testCapture'

export function GET() {
  if (env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(getTestEmails())
}

export function DELETE() {
  if (env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  clearTestEmails()
  return new NextResponse(null, { status: 204 })
}
