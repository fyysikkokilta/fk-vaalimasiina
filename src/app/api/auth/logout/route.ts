import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  
  // Clear the admin token cookie
  cookieStore.delete('admin-token')
  
  return NextResponse.json({ success: true })
}