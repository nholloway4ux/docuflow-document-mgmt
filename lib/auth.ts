import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  passwordHash: string
  createdAt: Date
  lastLogin?: Date
}

// In-memory storage for development - replace with database in production
let users: User[] = []

// Rate limiting storage
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>()

// Maximum login attempts per IP within the time window
const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createUser(username: string, password: string): Promise<User> {
  const existingUser = await getUserByUsername(username)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await hashPassword(password)
  const user: User = {
    id: generateId(),
    username,
    passwordHash,
    createdAt: new Date(),
  }

  users.push(user)
  return user
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return users.find(user => user.username === username) || null
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find(user => user.id === id) || null
}

export async function updateLastLogin(userId: string): Promise<void> {
  const user = await getUserById(userId)
  if (user) {
    user.lastLogin = new Date()
  }
}

export function checkRateLimit(identifier: string): boolean {
  const now = new Date()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if outside the time window
  if (now.getTime() - attempts.lastAttempt.getTime() > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
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

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier)
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)
  
  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  
  if (!isValidPassword) {
    return null
  }

  await updateLastLogin(user.id)
  return user
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Initialize default admin user for development
export async function initializeDefaultAdmin() {
  const adminExists = await getUserByUsername('admin')
  
  if (!adminExists) {
    try {
      await createUser('admin', 'admin123')
      console.log('Default admin user created: admin/admin123')
    } catch (error) {
      console.error('Failed to create default admin user:', error)
    }
  }
}

// Auto-initialize admin user
initializeDefaultAdmin()

export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase()
}

export function validateUsername(username: string): boolean {
  const sanitized = sanitizeInput(username)
  return sanitized.length >= 3 && sanitized.length <= 50 && /^[a-zA-Z0-9_]+$/.test(sanitized)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128
}