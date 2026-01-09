'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, CheckCircle, Code, Monitor, Smartphone, Tablet } from 'lucide-react'

export default function EmbedDemoPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('responsive')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  const embedUrl = `${baseUrl}/embed`

  const embedSizes = {
    responsive: { width: '100%', height: '800px' },
    desktop: { width: '1000px', height: '700px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '360px', height: '500px' },
    custom: { width: '800px', height: '600px' },
  }

  const embedExamples = [
    {
      title: 'WordPress Block Editor (Gutenberg)',
      description: 'Add this HTML block to your WordPress page or post',
      code: `<iframe 
  src="${embedUrl}"
  width="${embedSizes[selectedSize as keyof typeof embedSizes].width}" 
  height="${embedSizes[selectedSize as keyof typeof embedSizes].height}"
  frameborder="0"
  allowfullscreen="true"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>`,
      instructions: [
        'In WordPress editor, add a new block (+)',
        'Search for "Custom HTML" block',
        'Paste the iframe code above',
        'Preview or publish your page'
      ]
    },
    {
      title: 'WordPress Classic Editor',
      description: 'Switch to Text/HTML mode and paste this code',
      code: `<div style="margin: 20px 0;">
  <iframe 
    src="${embedUrl}"
    width="${embedSizes[selectedSize as keyof typeof embedSizes].width}" 
    height="${embedSizes[selectedSize as keyof typeof embedSizes].height}"
    frameborder="0"
    allowfullscreen="true"
    style="border: 1px solid #ddd; border-radius: 8px; max-width: 100%;">
  </iframe>
</div>`,
      instructions: [
        'Open your page/post in Classic Editor',
        'Switch to "Text" tab (HTML mode)',
        'Paste the iframe code where you want the PDF',
        'Switch back to "Visual" tab to see preview'
      ]
    },
    {
      title: 'WordPress Theme Template',
      description: 'Add to your theme files (header.php, footer.php, etc.)',
      code: `<?php if (is_page('bulletin') || is_front_page()): ?>
<div class="pdf-embed-container">
  <iframe 
    src="${embedUrl}"
    width="${embedSizes[selectedSize as keyof typeof embedSizes].width}" 
    height="${embedSizes[selectedSize as keyof typeof embedSizes].height}"
    frameborder="0"
    allowfullscreen="true"
    style="border: 1px solid #ddd; border-radius: 8px; max-width: 100%;">
  </iframe>
</div>
<?php endif; ?>`,
      instructions: [
        'Access your theme files via FTP or cPanel',
        'Edit the relevant template file',
        'Add the PHP/HTML code where needed',
        'Save and upload the file'
      ]
    },
    {
      title: 'WordPress Widget (HTML Widget)',
      description: 'Add to sidebar, footer, or any widget area',
      code: `<div style="text-align: center; margin-bottom: 20px;">
  <h3>This Week\'s Bulletin</h3>
  <iframe 
    src="${embedUrl}"
    width="${embedSizes[selectedSize as keyof typeof embedSizes].width}" 
    height="${embedSizes[selectedSize as keyof typeof embedSizes].height}"
    frameborder="0"
    style="border: 1px solid #ddd; border-radius: 8px; max-width: 100%;">
  </iframe>
</div>`,
      instructions: [
        'Go to Appearance → Widgets in WordPress',
        'Add "Custom HTML" widget to desired area',
        'Paste the code in the widget content',
        'Save the widget'
      ]
    },
    {
      title: 'Responsive Embed (Recommended)',
      description: 'Auto-adjusts to container size with aspect ratio',
      code: `<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%; /* 4:3 Aspect Ratio */">
  <iframe 
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px solid #ddd; border-radius: 8px;"
    frameborder="0"
    allowfullscreen="true">
  </iframe>
</div>`,
      instructions: [
        'This creates a responsive container',
        'The PDF will scale with the page width',
        'Maintains 4:3 aspect ratio',
        'Works on all device sizes'
      ]
    }
  ]

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PDF Embed Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Examples and code snippets for embedding PDFs in WordPress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.open(embedUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Embed
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Size Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preview Size
              </h2>
              <div className="space-y-3">
                {Object.entries(embedSizes).map(([key, { width, height }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSize(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedSize === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {key === 'responsive' && <Monitor className="h-4 w-4" />}
                      {key === 'desktop' && <Monitor className="h-4 w-4" />}
                      {key === 'tablet' && <Tablet className="h-4 w-4" />}
                      {key === 'mobile' && <Smartphone className="h-4 w-4" />}
                      {key === 'custom' && <Code className="h-4 w-4" />}
                      <span className="font-medium capitalize">{key}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {width} × {height}
                    </span>
                  </button>
                ))}
              </div>

              {/* Live Preview */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Live Preview
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
                  <div 
                    style={{ 
                      width: selectedSize === 'responsive' ? '100%' : embedSizes[selectedSize as keyof typeof embedSizes].width,
                      maxWidth: '100%',
                      height: '200px',
                      overflow: 'hidden',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <iframe 
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Examples */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {embedExamples.map((example, index) => (
                <div key={index} className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {example.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {example.description}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {/* Instructions */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Instructions:
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {example.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Code Block */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Code:
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(example.code, index)}
                          className="flex items-center space-x-1"
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{example.code}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Important Notes
              </h2>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>The embed URL automatically loads the selected church bulletin or latest PDF</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>The download button is prominently displayed in maroon color (#8B3A3A)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>The embed is mobile-responsive and works on all devices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You can specify custom PDFs using URL parameters: <code className="bg-blue-100 px-1 rounded">?pdf=URL&title=TITLE</code></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>For WordPress security, ensure your iframe embed settings allow external content</span>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h2>
              <p className="text-gray-600 mb-4">
                If you have questions about implementing the PDF embed in your WordPress site, 
                feel free to reach out for assistance.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" onClick={() => window.open(embedUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Embed
                </Button>
                <Button onClick={() => window.open(`${baseUrl}/admin`, '_blank')}>
                  Admin Panel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}