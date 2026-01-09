'use client'

import { useState } from 'react'
import { Code, Copy, CheckCircle, Monitor, Smartphone, Tablet, Info, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PDF } from '@/hooks/usePDFs'
import { generateEmbedCode, copyToClipboard, truncateFilename } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface EmbedCodeModalProps {
  pdf: PDF
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface EmbedOptions {
  width: number
  height: number
  responsive: boolean
}

const presetSizes = [
  { name: 'Small', width: 600, height: 450, icon: Smartphone },
  { name: 'Medium', width: 800, height: 600, icon: Tablet },
  { name: 'Large', width: 1000, height: 750, icon: Monitor },
  { name: 'Custom', width: 800, height: 600, icon: Code }
]

export function EmbedCodeModal({
  pdf,
  children,
  open,
  onOpenChange
}: EmbedCodeModalProps) {
  const [options, setOptions] = useState<EmbedOptions>({
    width: 800,
    height: 600,
    responsive: true
  })
  const [selectedPreset, setSelectedPreset] = useState('Medium')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleCopy = async (code: string, type: string) => {
    const success = await copyToClipboard(code)
    
    if (success) {
      setCopiedStates(prev => ({ ...prev, [type]: true }))
      toast({
        title: "Copied to clipboard",
        description: `${type} code copied successfully.`
      })
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    const presetData = presetSizes.find(p => p.name === preset)
    if (presetData && preset !== 'Custom') {
      setOptions(prev => ({
        ...prev,
        width: presetData.width,
        height: presetData.height
      }))
    }
  }

  const responsiveCode = generateEmbedCode(pdf.id, { 
    ...options, 
    responsive: true 
  })
  
  const fixedCode = generateEmbedCode(pdf.id, { 
    ...options, 
    responsive: false 
  })

  const wordPressShortcode = `[pdf_embedder url="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'}/api/pdfs/${pdf.id}/download"]`

  const dialogContent = (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Code className="w-4 h-4 text-blue-600" />
          </div>
          <span>Embed Code</span>
        </DialogTitle>
        <DialogDescription>
          Copy and paste this code to embed your PDF on any website.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* PDF Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>{truncateFilename(pdf.originalName, 50)}</span>
              {pdf.selected && (
                <Badge variant="default" className="ml-auto">
                  Published
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Size Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Size Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset sizes */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Preset Sizes
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {presetSizes.map((preset) => {
                  const Icon = preset.icon
                  const isSelected = selectedPreset === preset.name
                  
                  return (
                    <Button
                      key={preset.name}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col h-auto py-3"
                      onClick={() => handlePresetChange(preset.name)}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{preset.name}</span>
                      {preset.name !== 'Custom' && (
                        <span className="text-xs opacity-70">
                          {preset.width}×{preset.height}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Custom dimensions */}
            {selectedPreset === 'Custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={options.width}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value) || 800 
                    }))}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="200"
                    max="1920"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={options.height}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      height: parseInt(e.target.value) || 600 
                    }))}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="150"
                    max="1080"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Embed Codes */}
        <Tabs defaultValue="responsive" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responsive">Responsive</TabsTrigger>
            <TabsTrigger value="fixed">Fixed Size</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          </TabsList>

          <TabsContent value="responsive" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Responsive Iframe (Recommended)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(responsiveCode, 'Responsive')}
                    disabled={copiedStates.responsive}
                  >
                    {copiedStates.responsive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardTitle>
                <div className="flex items-start space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Automatically adjusts to container width. Perfect for responsive websites.
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                  <code>{responsiveCode}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixed" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Fixed Size Iframe</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(fixedCode, 'Fixed size')}
                    disabled={copiedStates.fixed}
                  >
                    {copiedStates.fixed ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardTitle>
                <div className="flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Fixed dimensions. Use when you need precise control over the size.
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                  <code>{fixedCode}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wordpress" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>WordPress Shortcode</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(wordPressShortcode, 'WordPress shortcode')}
                    disabled={copiedStates.wordpress}
                  >
                    {copiedStates.wordpress ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardTitle>
                <div className="flex items-start space-x-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    For WordPress sites with PDF Embedder plugin installed.
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                  <code>{wordPressShortcode}</code>
                </pre>
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">WordPress Integration Tips:</span>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Install the PDF Embedder plugin from WordPress repository</li>
                    <li>• Paste this shortcode in any post or page</li>
                    <li>• The PDF will be embedded directly in your content</li>
                    <li>• No iframe needed - works with all WordPress themes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Link */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Preview your embedded PDF
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/embed/${pdf.id}`, '_blank')}
              >
                Open Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  )

  // If controlled (open prop provided), don't use trigger
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    )
  }

  // If uncontrolled, use trigger
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Code className="w-4 h-4 mr-1" />
            Embed
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}