import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { tags } = (await req.json()) as { tags: string[] }
  if (!tags) return NextResponse.json({ error: 'Missing tag' }, { status: 400 })

  tags.forEach((tag) => revalidateTag(tag))
  return NextResponse.json({ message: `Revalidated tag: ${tags.join(', ')}` })
}

export function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
