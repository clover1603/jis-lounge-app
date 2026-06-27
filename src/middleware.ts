import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/board', '/messages', '/mypage', '/stores', '/checkin', '/order']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Supabase auth cookie check (project ref: cnfogjfzcylebblicaie)
  const hasSession = [...request.cookies.getAll()].some(c =>
    c.name.startsWith('sb-cnfogjfzcylebblicaie-auth-token')
  )
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
