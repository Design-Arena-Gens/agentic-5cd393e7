import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Sheet Music Analyzer',
  description: 'Analyze audio compositions and generate sheet music',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
