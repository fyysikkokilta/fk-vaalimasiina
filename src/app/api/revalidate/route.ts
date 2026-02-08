import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { env } from '~/env'

export async function POST(req: Request) {
  if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paths = Array.isArray((body as { paths?: unknown }).paths)
    ? ((body as { paths: unknown[] }).paths.filter(
        (p): p is string => typeof p === 'string'
      ) as string[])
    : null

  if (!paths || paths.length === 0) {
    return NextResponse.json({ error: 'Missing or empty paths array' }, { status: 400 })
  }

  paths.forEach((path) => revalidatePath(path, 'page'))
  return NextResponse.json({
    message: `Revalidated path: ${paths.join(', ')}`
  })
}

export function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
