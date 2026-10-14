import './globals.css'
import './components.css'

import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'ScanSurat UNKRIS',
  description: 'Aplikasi pemindai surat untuk portal UNKRIS',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scansurat-unkris.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ScanSurat UNKRIS',
    description: 'Aplikasi pemindai surat dengan OCR untuk portal UNKRIS',
    url: '/',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ScanSurat" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-slate-50">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  )
}
