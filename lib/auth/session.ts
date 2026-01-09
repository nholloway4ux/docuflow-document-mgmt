import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production'
)

const SESSION_COOKIE_NAME = 'pdf-admin-session'
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export interface SessionData {
  userId: string
  username: string
  iat: number
  exp: number
}

// Create a new session token
export async function createSessionToken(userId: string, username: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (SESSION_EXPIRY / 1000)

  const token = await new SignJWT({
    userId,
    username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(SESSION_SECRET)

  return token
}

// Verify and decode session token
export async function verifySessionToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    }
  } catch (error) {
    console.error('Session token verification failed:', error)
    return null
  }
}

// Create session and set cookie
export async function createSession(userId: string, username: string): Promise<void> {
  const token = await createSessionToken(userId, username)
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  })
}

// Get session from cookies
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  return await verifySessionToken(token)
}

// Get session from request (for middleware)
export async function getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  return await verifySessionToken(token)
}

// Clear session cookie
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

// Clear session cookie in response
export function clearSessionInResponse(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  
  return response
}

// Check if session is valid and not expired
export function isSessionValid(session: SessionData): boolean {
  const now = Math.floor(Date.now() / 1000)
  return session.exp > now
}

// Refresh session if it's close to expiry
export async function refreshSessionIfNeeded(session: SessionData): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = session.exp - now
  const refreshThreshold = 60 * 60 // 1 hour
  
  // Refresh if less than 1 hour remaining
  if (timeUntilExpiry < refreshThreshold) {
    await createSession(session.userId, session.username)
  }
}

// Create session response with token
export async function createSessionResponse(
  userId: string,
  username: string,
  data: any
): Promise<NextResponse> {
  const token = await createSessionToken(userId, username)
  const response = NextResponse.json(data)
  
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  })
  
  return response
}