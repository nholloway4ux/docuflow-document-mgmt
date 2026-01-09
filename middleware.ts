import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Check if user is authenticated for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Special headers for embed routes (allow iframe)
  if (req.nextUrl.pathname.startsWith('/embed')) {
    res.headers.delete('X-Frame-Options')
    res.headers.set('Content-Security-Policy', "frame-ancestors *;")
    res.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/embed/:path*']
}