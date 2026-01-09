import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, SessionData } from './session'

export interface AuthMiddlewareOptions {
  redirectTo?: string
  requireAuth?: boolean
  allowedRoles?: string[]
}

// Rate limiting storage for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>()

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

// Check if IP is rate limited
export function checkRateLimit(ip: string): boolean {
  const now = new Date()
  const attempts = loginAttempts.get(ip)

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if outside the time window
  if (now.getTime() - attempts.lastAttempt.getTime() > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Check if exceeded limit
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return false
  }

  // Increment attempt count
  attempts.count++
  attempts.lastAttempt = now
  return true
}

// Reset rate limit for IP
export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip)
}

// Get client IP from request
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-forwarded-proto')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  return remoteAddr || '127.0.0.1'
}

// Authentication middleware
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<NextResponse | { session: SessionData | null; isAuthenticated: boolean }> {
  const { redirectTo = '/login', requireAuth = true } = options
  
  try {
    const session = await getSessionFromRequest(request)
    const isAuthenticated = session !== null
    
    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const loginUrl = new URL(redirectTo, request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // If user is authenticated but trying to access login page
    if (isAuthenticated && request.nextUrl.pathname === '/login') {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
    
    return { session, isAuthenticated }
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    if (requireAuth) {
      const loginUrl = new URL(redirectTo, request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    return { session: null, isAuthenticated: false }
  }
}

// Check if route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/admin',
    '/api/pdfs',
    '/api/uploads',
    '/api/settings',
  ]
  
  return protectedPaths.some(path => pathname.startsWith(path))
}

// Check if route is public (always accessible)
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/login',
    '/embed',
    '/display',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/auth/setup',
    '/',
  ]
  
  return publicPaths.some(path => {
    if (path === '/') {
      return pathname === path
    }
    return pathname.startsWith(path)
  })
}

// Validate CSRF token (for state-changing operations)
export function validateCSRFToken(request: NextRequest, token?: string): boolean {
  // In a production app, you'd implement proper CSRF protection
  // For now, we'll just check that the request is from the same origin
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  if (!origin && !referer) {
    return false
  }
  
  const allowedOrigin = `${request.nextUrl.protocol}//${host}`
  
  if (origin && origin !== allowedOrigin) {
    return false
  }
  
  if (referer && !referer.startsWith(allowedOrigin)) {
    return false
  }
  
  return true
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 255) // Limit length
}

// Validate username format
export function validateUsername(username: string): boolean {
  const sanitized = sanitizeInput(username)
  return sanitized.length >= 3 && 
         sanitized.length <= 50 && 
         /^[a-zA-Z0-9_]+$/.test(sanitized)
}

// Validate password format
export function validatePassword(password: string): boolean {
  return password.length >= 8 && 
         password.length <= 128 &&
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
}

// Create error response with rate limiting headers
export function createRateLimitResponse(retryAfter: number = 900): NextResponse {
  const response = NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      retryAfter 
    },
    { status: 429 }
  )
  
  response.headers.set('Retry-After', retryAfter.toString())
  response.headers.set('X-RateLimit-Limit', MAX_LOGIN_ATTEMPTS.toString())
  response.headers.set('X-RateLimit-Remaining', '0')
  response.headers.set('X-RateLimit-Reset', (Date.now() + RATE_LIMIT_WINDOW).toString())
  
  return response
}