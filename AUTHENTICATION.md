# PDF Embedder - Authentication System

This document describes the complete authentication system implemented for the PDF Embedder application.

## Overview

The authentication system provides secure session-based authentication with the following features:

- **Secure password hashing** using bcrypt with 12 salt rounds
- **JWT-based sessions** stored in httpOnly cookies
- **Rate limiting** on login attempts (5 attempts per 15 minutes per IP)
- **CSRF protection** for state-changing operations
- **Supabase database integration** for user storage
- **Admin setup flow** for initial user creation
- **Session auto-refresh** to maintain user sessions

## Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL editor:

```bash
# Copy and execute the contents of:
/lib/db/init.sql
```

This creates:
- `users` table with proper indexes
- Row-level security policies
- Required database functions

### 2. Environment Variables

Ensure these variables are set in your `.env.local`:

```env
# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Configuration (optional - for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
```

### 3. Initial Setup

1. Start your Next.js application
2. Navigate to `/login`
3. If no users exist, you'll see a setup form
4. Create the first admin user
5. You'll be automatically logged in

## Architecture

### Core Components

#### Authentication API Routes

- **POST /api/auth/login** - User login with rate limiting
- **POST /api/auth/logout** - User logout and session clearing
- **GET /api/auth/me** - Get current user information
- **POST /api/auth/setup** - Create first admin user (only when no users exist)
- **GET /api/auth/setup** - Check if setup is required

#### Session Management (`/lib/auth/session.ts`)

- JWT token creation and verification using `jose` library
- Secure cookie configuration with httpOnly, secure, sameSite
- Session expiry (24 hours) and refresh logic
- Server and client-side session handling

#### Database Layer (`/lib/db/users.ts`)

- User CRUD operations with Supabase
- Password hashing and verification
- User authentication and validation
- Input sanitization and validation

#### Middleware (`/lib/auth/middleware.ts`)

- Rate limiting for login attempts
- IP-based protection
- Input validation and CSRF protection
- Route protection utilities

#### React Hooks (`/hooks/useAuth.ts`)

- `useAuth()` hook for authentication state management
- Login, logout, and setup functions
- Error handling and loading states
- Automatic session checking

#### Context (`/contexts/AuthContext.tsx`)

- Global authentication state provider
- Automatic session refresh
- Higher-order components for route protection

#### UI Components

- **Login Page** (`/app/login/page.tsx`) - Professional login form with setup flow
- **Protected Routes** (`/components/auth/ProtectedRoute.tsx`) - Route protection components
- **Admin Layout** (`/app/admin/layout.tsx`) - Protected admin layout
- **Header** (`/components/admin/header.tsx`) - User info and logout functionality

### Security Features

#### Password Security
- Bcrypt hashing with 12 salt rounds
- Password validation requiring uppercase, lowercase, and numbers
- Minimum 8 characters, maximum 128 characters

#### Session Security
- JWT tokens signed with HS256
- HttpOnly cookies prevent XSS attacks
- Secure cookies in production
- SameSite=strict prevents CSRF
- 24-hour session expiry
- Automatic session refresh (when < 1 hour remaining)

#### Rate Limiting
- Maximum 5 login attempts per IP per 15 minutes
- Automatic reset on successful login
- IP-based tracking with cleanup

#### Input Validation
- Username format validation (3-50 chars, alphanumeric + underscore)
- Password strength requirements
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization

#### CSRF Protection
- Origin and referer header validation
- Same-origin policy enforcement

### Route Protection

#### Middleware (`/middleware.ts`)
- Protects `/admin/*` routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Preserves intended destination with redirect parameter

#### Protected Routes
- Client-side protection using React components
- Server-side protection via middleware
- Loading states during authentication checks
- Automatic redirects with return URLs

## Usage Examples

### Using the useAuth Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isLoading, login, logout } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}
```

### Protecting a Page

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <div>This content is protected</div>
    </ProtectedRoute>
  )
}
```

### Using the Auth Context

```tsx
import { useAuthContext } from '@/contexts/AuthContext'

function MyComponent() {
  const { isAuthenticated, user, error } = useAuthContext()

  return (
    <div>
      {isAuthenticated ? (
        <p>Authenticated as {user?.username}</p>
      ) : (
        <p>Not authenticated</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

## API Reference

### Authentication Endpoints

#### POST /api/auth/login
```json
// Request
{
  "username": "admin",
  "password": "securepassword123"
}

// Response (Success)
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "admin",
    "lastLogin": "2024-01-07T12:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}

// Response (Error)
{
  "error": "Invalid username or password"
}
```

#### GET /api/auth/me
```json
// Response (Authenticated)
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "createdAt": "2024-01-01T12:00:00Z",
    "lastLogin": "2024-01-07T12:00:00Z",
    "isActive": true
  }
}

// Response (Unauthenticated)
{
  "error": "Unauthorized"
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## Security Considerations

### Production Recommendations

1. **Change Default Secrets**
   - Set a strong `SESSION_SECRET` (64+ random characters)
   - Use environment-specific secrets

2. **Database Security**
   - Enable Row Level Security (RLS)
   - Use service role key only in server-side code
   - Regularly audit user access

3. **Monitoring**
   - Monitor failed login attempts
   - Set up alerts for unusual authentication patterns
   - Log security events

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

## Troubleshooting

### Common Issues

1. **"Users table does not exist"**
   - Run the SQL script from `/lib/db/init.sql` in Supabase

2. **Session expires immediately**
   - Check `SESSION_SECRET` is set correctly
   - Verify cookie settings in production

3. **Rate limit too aggressive**
   - Adjust `MAX_LOGIN_ATTEMPTS` and `RATE_LIMIT_WINDOW` in middleware

4. **CSRF errors**
   - Ensure requests include proper origin headers
   - Check for reverse proxy configuration

## Development vs Production

### Development
- Uses HTTP cookies (secure: false)
- More permissive CSRF checking
- Detailed error messages
- Console logging

### Production
- HTTPS-only cookies (secure: true)
- Strict CSRF validation
- Generic error messages
- Structured logging

## Contributing

When modifying the authentication system:

1. Update password hashing if changing bcrypt settings
2. Test rate limiting changes thoroughly
3. Validate all user inputs
4. Update this documentation
5. Run security tests
6. Consider backward compatibility for sessions

---

For questions or issues, please refer to the codebase or create an issue in the project repository.