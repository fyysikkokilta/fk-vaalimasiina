import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { paths } = (await req.json()) as {
    paths: string[]
  }
  if (!paths)
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  paths.forEach((path) => revalidatePath(path, 'page'))
  return NextResponse.json({
    message: `Revalidated path: ${paths.join(', ')}`
  })
}

export function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
