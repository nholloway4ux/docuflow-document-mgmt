import { createServerClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  password_hash: string
  created_at: string
  last_login?: string
  is_active: boolean
}

export interface UserWithoutPassword {
  id: string
  username: string
  created_at: string
  last_login?: string
  is_active: boolean
}

// Initialize database tables
export async function initializeUsersTable() {
  const supabase = createServerClient()
  
  // Check if users table exists by trying to query it
  try {
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()

    // If there's no error or it's just "no rows returned", table exists
    if (!checkError || checkError.code === 'PGRST116') {
      console.log('Users table already exists')
      return true
    }

    // If we get here, log the error but don't throw
    console.log('Users table check resulted in:', checkError)
    
    // Return false to indicate table might not exist, but don't throw
    return false
    
  } catch (error) {
    console.error('Error checking users table:', error)
    
    // Don't throw, just return false to allow the app to continue
    return false
  }
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Create a new user
export async function createUser(username: string, password: string): Promise<UserWithoutPassword> {
  const supabase = createServerClient()
  
  // Check if username already exists
  const existingUser = await getUserByUsername(username)
  if (existingUser) {
    throw new Error('Username already exists')
  }

  const passwordHash = await hashPassword(password)
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username: username.toLowerCase().trim(),
        password_hash: passwordHash,
        is_active: true
      }
    ])
    .select('id, username, created_at, last_login, is_active')
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }

  return data as UserWithoutPassword
}

// Get user by username (including password hash for authentication)
export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase().trim())
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }

  return data as User
}

// Get user by ID (without password hash)
export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('id, username, created_at, last_login, is_active')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    console.error('Error fetching user by ID:', error)
    throw new Error('Failed to fetch user')
  }

  return data as UserWithoutPassword
}

// Update user's last login timestamp
export async function updateLastLogin(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating last login:', error)
    throw new Error('Failed to update last login')
  }
}

// Authenticate user with username and password
export async function authenticateUser(username: string, password: string): Promise<UserWithoutPassword | null> {
  const user = await getUserByUsername(username)
  
  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password_hash)
  
  if (!isValidPassword) {
    return null
  }

  // Update last login
  await updateLastLogin(user.id)

  // Return user without password hash
  return {
    id: user.id,
    username: user.username,
    created_at: user.created_at,
    last_login: new Date().toISOString(),
    is_active: user.is_active
  }
}

// Check if any users exist in the database
export async function hasAnyUsers(): Promise<boolean> {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  if (error) {
    console.error('Error checking user count:', error)
    throw new Error('Failed to check user count')
  }

  return (count || 0) > 0
}

// Create the first admin user (only works if no users exist)
export async function createFirstAdmin(username: string, password: string): Promise<UserWithoutPassword> {
  const hasUsers = await hasAnyUsers()
  
  if (hasUsers) {
    throw new Error('Admin user can only be created when no users exist')
  }

  // Validate input
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters long')
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  return await createUser(username, password)
}

// Input validation functions
export function validateUsername(username: string): boolean {
  const trimmed = username.trim()
  return trimmed.length >= 3 && 
         trimmed.length <= 50 && 
         /^[a-zA-Z0-9_]+$/.test(trimmed)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && 
         password.length <= 128 &&
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim()
}