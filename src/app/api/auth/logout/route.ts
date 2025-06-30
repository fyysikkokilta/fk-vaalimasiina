import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()

  // Clear the admin token cookie
  cookieStore.delete('admin-token')

  return NextResponse.json({ success: true })
}
