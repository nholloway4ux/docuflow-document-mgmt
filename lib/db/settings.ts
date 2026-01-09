import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Setting, Database } from '@/types'

// Database error types
export class SettingsError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode = 500) {
    super(message)
    this.name = 'SettingsError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Initialize Supabase client for database operations
function getDatabaseClient(): SupabaseClient<Database> | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials not found, using mock settings database')
      return null
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    return null
  }
}

// Mock settings database for development when Supabase is not configured
class MockSettingsDatabase {
  private settings = new Map<string, Setting>()
  private idCounter = 1

  constructor() {
    // Initialize with default settings
    this.seedMockSettings()
  }

  private seedMockSettings() {
    const defaultSettings: Omit<Setting, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        key: 'selected_pdf_id',
        value: '',
        description: 'ID of the currently selected/published PDF',
        is_public: false
      },
      {
        key: 'app_name',
        value: 'PDF Embedder',
        description: 'Application name',
        is_public: true
      },
      {
        key: 'max_file_size',
        value: '52428800', // 50MB in bytes
        description: 'Maximum file upload size in bytes',
        is_public: true
      },
      {
        key: 'enable_public_uploads',
        value: 'true', // Temporarily enabled for testing
        description: 'Allow public users to upload PDFs',
        is_public: true
      },
      {
        key: 'enable_download',
        value: 'true',
        description: 'Allow PDF downloads',
        is_public: true
      },
      {
        key: 'default_embed_width',
        value: '100%',
        description: 'Default width for PDF embeds',
        is_public: true
      },
      {
        key: 'default_embed_height',
        value: '600px',
        description: 'Default height for PDF embeds',
        is_public: true
      }
    ]

    defaultSettings.forEach(setting => {
      const id = `mock-setting-${this.idCounter++}`
      const now = new Date().toISOString()
      this.settings.set(setting.key, {
        ...setting,
        id,
        created_at: now,
        updated_at: now
      })
    })
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settings.get(key) || null
  }

  async findAll(isPublic?: boolean): Promise<Setting[]> {
    let settings = Array.from(this.settings.values())
    
    if (isPublic !== undefined) {
      settings = settings.filter(s => s.is_public === isPublic)
    }
    
    return settings.sort((a, b) => a.key.localeCompare(b.key))
  }

  async upsert(key: string, value: string, description?: string, isPublic = false): Promise<Setting> {
    const existing = this.settings.get(key)
    const now = new Date().toISOString()
    
    if (existing) {
      const updated: Setting = {
        ...existing,
        value,
        description: description || existing.description,
        is_public: isPublic,
        updated_at: now
      }
      this.settings.set(key, updated)
      return updated
    } else {
      const id = `mock-setting-${this.idCounter++}`
      const newSetting: Setting = {
        id,
        key,
        value,
        description,
        is_public: isPublic,
        created_at: now,
        updated_at: now
      }
      this.settings.set(key, newSetting)
      return newSetting
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.settings.delete(key)
  }
}

// Global mock database instance
const mockSettingsDB = new MockSettingsDatabase()

// Setting keys constants
export const SETTING_KEYS = {
  SELECTED_PDF_ID: 'selected_pdf_id',
  APP_NAME: 'app_name',
  MAX_FILE_SIZE: 'max_file_size',
  ENABLE_PUBLIC_UPLOADS: 'enable_public_uploads',
  ENABLE_DOWNLOAD: 'enable_download',
  DEFAULT_EMBED_WIDTH: 'default_embed_width',
  DEFAULT_EMBED_HEIGHT: 'default_embed_height',
} as const

// Get setting by key
export async function getSetting(key: string): Promise<Setting | null> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockSettingsDB.findByKey(key)
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new SettingsError(
        `Failed to fetch setting: ${error.message}`,
        'FETCH_FAILED'
      )
    }

    return data
  } catch (error) {
    if (error instanceof SettingsError) {
      throw error
    }
    throw new SettingsError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Get setting value by key (returns the value directly)
export async function getSettingValue(key: string, defaultValue?: string): Promise<string | null> {
  const setting = await getSetting(key)
  return setting?.value || defaultValue || null
}

// Get all settings
export async function getAllSettings(isPublic?: boolean): Promise<Setting[]> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockSettingsDB.findAll(isPublic)
  }

  try {
    let query = supabase
      .from('settings')
      .select('*')
      .order('key')

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    const { data, error } = await query

    if (error) {
      throw new SettingsError(
        `Failed to fetch settings: ${error.message}`,
        'FETCH_FAILED'
      )
    }

    return data || []
  } catch (error) {
    if (error instanceof SettingsError) {
      throw error
    }
    throw new SettingsError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Set/update setting
export async function setSetting(
  key: string,
  value: string,
  description?: string,
  isPublic = false
): Promise<Setting> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockSettingsDB.upsert(key, value, description, isPublic)
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        description,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new SettingsError(
        `Failed to set setting: ${error.message}`,
        'UPSERT_FAILED'
      )
    }

    return data
  } catch (error) {
    if (error instanceof SettingsError) {
      throw error
    }
    throw new SettingsError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Delete setting
export async function deleteSetting(key: string): Promise<boolean> {
  const supabase = getDatabaseClient()

  if (!supabase) {
    // Use mock database
    return mockSettingsDB.delete(key)
  }

  try {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key)

    if (error) {
      throw new SettingsError(
        `Failed to delete setting: ${error.message}`,
        'DELETE_FAILED'
      )
    }

    return true
  } catch (error) {
    if (error instanceof SettingsError) {
      throw error
    }
    throw new SettingsError(
      `Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DATABASE_ERROR'
    )
  }
}

// Get selected PDF ID
export async function getSelectedPDFId(): Promise<string | null> {
  return getSettingValue(SETTING_KEYS.SELECTED_PDF_ID)
}

// Set selected PDF ID
export async function setSelectedPDFId(pdfId: string): Promise<void> {
  await setSetting(
    SETTING_KEYS.SELECTED_PDF_ID,
    pdfId,
    'ID of the currently selected/published PDF',
    false
  )
}

// Clear selected PDF ID
export async function clearSelectedPDFId(): Promise<void> {
  await setSetting(
    SETTING_KEYS.SELECTED_PDF_ID,
    '',
    'ID of the currently selected/published PDF',
    false
  )
}

// Get app configuration settings
export async function getAppConfig(): Promise<{
  appName: string
  maxFileSize: number
  enablePublicUploads: boolean
  enableDownload: boolean
  defaultEmbedWidth: string
  defaultEmbedHeight: string
}> {
  const settings = await getAllSettings(true)
  const settingsMap = new Map(settings.map(s => [s.key, s.value]))

  return {
    appName: settingsMap.get(SETTING_KEYS.APP_NAME) || 'PDF Embedder',
    maxFileSize: parseInt(settingsMap.get(SETTING_KEYS.MAX_FILE_SIZE) || '52428800'),
    enablePublicUploads: settingsMap.get(SETTING_KEYS.ENABLE_PUBLIC_UPLOADS) === 'true',
    enableDownload: settingsMap.get(SETTING_KEYS.ENABLE_DOWNLOAD) !== 'false',
    defaultEmbedWidth: settingsMap.get(SETTING_KEYS.DEFAULT_EMBED_WIDTH) || '100%',
    defaultEmbedHeight: settingsMap.get(SETTING_KEYS.DEFAULT_EMBED_HEIGHT) || '600px'
  }
}

// Update app configuration
export async function updateAppConfig(config: {
  appName?: string
  maxFileSize?: number
  enablePublicUploads?: boolean
  enableDownload?: boolean
  defaultEmbedWidth?: string
  defaultEmbedHeight?: string
}): Promise<void> {
  const updates: Array<Promise<Setting>> = []

  if (config.appName !== undefined) {
    updates.push(setSetting(SETTING_KEYS.APP_NAME, config.appName, 'Application name', true))
  }
  
  if (config.maxFileSize !== undefined) {
    updates.push(setSetting(SETTING_KEYS.MAX_FILE_SIZE, config.maxFileSize.toString(), 'Maximum file upload size in bytes', true))
  }
  
  if (config.enablePublicUploads !== undefined) {
    updates.push(setSetting(SETTING_KEYS.ENABLE_PUBLIC_UPLOADS, config.enablePublicUploads.toString(), 'Allow public users to upload PDFs', true))
  }
  
  if (config.enableDownload !== undefined) {
    updates.push(setSetting(SETTING_KEYS.ENABLE_DOWNLOAD, config.enableDownload.toString(), 'Allow PDF downloads', true))
  }
  
  if (config.defaultEmbedWidth !== undefined) {
    updates.push(setSetting(SETTING_KEYS.DEFAULT_EMBED_WIDTH, config.defaultEmbedWidth, 'Default width for PDF embeds', true))
  }
  
  if (config.defaultEmbedHeight !== undefined) {
    updates.push(setSetting(SETTING_KEYS.DEFAULT_EMBED_HEIGHT, config.defaultEmbedHeight, 'Default height for PDF embeds', true))
  }

  await Promise.all(updates)
}

// Initialize default settings (useful for first-time setup)
export async function initializeDefaultSettings(): Promise<void> {
  const defaultSettings = [
    { key: SETTING_KEYS.APP_NAME, value: 'PDF Embedder', description: 'Application name', isPublic: true },
    { key: SETTING_KEYS.MAX_FILE_SIZE, value: '52428800', description: 'Maximum file upload size in bytes', isPublic: true },
    { key: SETTING_KEYS.ENABLE_PUBLIC_UPLOADS, value: 'false', description: 'Allow public users to upload PDFs', isPublic: true },
    { key: SETTING_KEYS.ENABLE_DOWNLOAD, value: 'true', description: 'Allow PDF downloads', isPublic: true },
    { key: SETTING_KEYS.DEFAULT_EMBED_WIDTH, value: '100%', description: 'Default width for PDF embeds', isPublic: true },
    { key: SETTING_KEYS.DEFAULT_EMBED_HEIGHT, value: '600px', description: 'Default height for PDF embeds', isPublic: true },
    { key: SETTING_KEYS.SELECTED_PDF_ID, value: '', description: 'ID of the currently selected/published PDF', isPublic: false }
  ]

  for (const setting of defaultSettings) {
    const existing = await getSetting(setting.key)
    if (!existing) {
      await setSetting(setting.key, setting.value, setting.description, setting.isPublic)
    }
  }
}