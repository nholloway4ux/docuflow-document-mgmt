import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Church Bulletin - PDF Embed',
  description: 'Embeddable PDF viewer for church bulletins and documents',
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