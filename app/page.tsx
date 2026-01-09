import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            PDF Embedder
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A secure platform for embedding and displaying PDFs with comprehensive admin controls. 
            Upload, manage, and embed your PDFs with ease.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">
                Admin Login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/display">
                View PDFs
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Secure Upload</h3>
              <p className="text-gray-600">
                Upload and manage your PDF documents with enterprise-grade security and access controls.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Easy Embedding</h3>
              <p className="text-gray-600">
                Generate embeddable links for your PDFs that work seamlessly across any website or platform.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Admin Controls</h3>
              <p className="text-gray-600">
                Comprehensive admin panel to manage settings, users, and monitor PDF access and usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}