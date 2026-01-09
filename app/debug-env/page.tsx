'use client'

import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
  const [envInfo, setEnvInfo] = useState<any>({})

  useEffect(() => {
    // Check what environment variables are available
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' 
        : 'NOT SET',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
    }
    
    setEnvInfo(info)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4">Quick Test</h2>
          <button
            onClick={async () => {
              try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxqwaklciqjarvatwfnv.supabase.co'
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cXdha2xjaXFqYXJ2YXR3Zm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDE0NTUsImV4cCI6MjA4MzM3NzQ1NX0.FLwurR6LOvm83scKuV0wWy6HuZR49j47_e0CCAvLE-o'
                
                console.log('Testing with URL:', url)
                console.log('Testing with Key (first 50 chars):', key.substring(0, 50))
                
                const response = await fetch(`${url}/auth/v1/health`, {
                  headers: {
                    'apikey': key,
                    'Content-Type': 'application/json'
                  }
                })
                
                alert(`Health check response: ${response.status} ${response.statusText}`)
              } catch (error: any) {
                alert(`Error: ${error.message}`)
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Supabase Connection
          </button>
        </div>
      </div>
    </div>
  )
}