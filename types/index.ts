// Database entity types
export interface User {
  id: string
  email: string
  password_hash: string
  full_name?: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface PDF {
  id: string
  title: string
  filename: string
  original_filename: string
  file_size: number
  file_path: string
  mime_type: string
  description?: string
  is_active: boolean
  is_public: boolean
  download_count: number
  view_count: number
  storage_url?: string
  embed_code?: string
  uploaded_by?: string
  uploaded_at?: string
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value?: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form data types
export interface LoginFormData {
  username: string
  password: string
}

export interface PDFUploadFormData {
  title: string
  description?: string
  is_public: boolean
  file: File
}

export interface SettingFormData {
  key: string
  value: string
  description?: string
  is_public: boolean
}

// Authentication types
export interface AuthUser {
  id: string
  username: string
  createdAt: Date
  lastLogin?: Date
}

export interface SessionPayload {
  userId: string
  username: string
  expiresAt: Date
}

export interface AuthResponse {
  success: boolean
  error?: string
  user?: AuthUser
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

// Component prop types
export interface PDFViewerProps {
  pdfUrl: string
  width?: string
  height?: string
  showControls?: boolean
}

export interface EmbedCodeGeneratorProps {
  pdfId: string
  pdfTitle: string
  defaultWidth?: string
  defaultHeight?: string
}

// Utility types
export type PDFFileInfo = {
  name: string
  size: number
  type: string
  lastModified: number
}

export type UploadProgress = {
  loaded: number
  total: number
  percentage: number
}

// Application settings types
export interface AppSettings {
  app_name: string
  max_file_size: number
  allowed_file_types: string[]
  enable_public_uploads: boolean
  enable_download: boolean
  default_embed_width: string
  default_embed_height: string
}

// Error types
export interface PDFEmbedderError extends Error {
  code?: string
  statusCode?: number
}

// Supabase specific types
export interface SupabaseUser extends User {}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      pdfs: {
        Row: PDF
        Insert: Omit<PDF, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>
        Update: Partial<Omit<PDF, 'id' | 'created_at' | 'updated_at'>>
      }
      settings: {
        Row: Setting
        Insert: Omit<Setting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Setting, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}