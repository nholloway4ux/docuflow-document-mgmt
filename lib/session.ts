import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-development'
const key = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: string
  username: string
  expiresAt: Date
}

export async function createSession(userId: string, username: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  const session = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  return session
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value

  if (!cookie) {
    return null
  }

  try {
    const { payload } = await jwtVerify(cookie, key, {
      algorithms: ['HS256'],
    })

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      expiresAt: new Date((payload.exp as number) * 1000),
    }
  } catch (error) {
    return null
  }
}

export async function verifySessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const cookie = request.cookies.get('session')?.value

  if (!cookie) {
    return null
  }

  try {
    const { payload } = await jwtVerify(cookie, key, {
      algorithms: ['HS256'],
    })

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      expiresAt: new Date((payload.exp as number) * 1000),
    }
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export function createSessionResponse(response: NextResponse, session: string, expiresAt: Date) {
  response.cookies.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
  return response
}

export function deleteSessionResponse(response: NextResponse) {
  response.cookies.delete('session')
  return response
}