import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DocuFlow - Document Viewer',
  description: 'Embeddable document viewer for secure PDF display',
  robots: {
    index: false,
    follow: false,
  },
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full min-h-screen bg-white">
      {children}
    </div>
  )
}