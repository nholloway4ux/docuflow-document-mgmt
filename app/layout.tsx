import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const lora = Lora({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'DocuFlow - Secure Document Management',
  description: 'A secure platform for embedding and displaying PDFs with admin controls',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}