import { NextResponse, type NextRequest } from 'next/server'

// Edge-safe passthrough middleware to avoid runtime crashes in production.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
