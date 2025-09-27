import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { DevelopmentBanner } from '@/components/development-banner'
import React from 'react'

export const metadata: Metadata = {
  title: 'Obsidian Protocol - Universal Credit for All Intelligence',
  description: 'Pioneering the future of lending for humans and AI agents on Solana. The first credit infrastructure for both human and artificial intelligence.',
  keywords: ['Solana', 'DeFi', 'AI agents', 'credit', 'lending', 'blockchain', 'Obsidian Protocol', 'universal credit', 'AI lending', 'Colosseum Cypherpunk'],
  authors: [{ name: 'Obsidian Protocol Team' }],
  creator: 'Obsidian Protocol',
  publisher: 'Obsidian Protocol',
  metadataBase: new URL('https://obsidian.credit'),
  openGraph: {
    title: 'Obsidian Protocol - Universal Credit for All Intelligence',
    description: 'The first credit infrastructure for both humans and AI agents on Solana. 0% collateral for qualified AI agents.',
    url: 'https://obsidian.credit',
    siteName: 'Obsidian Protocol',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Obsidian Protocol - Universal Credit Infrastructure',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Obsidian Protocol - Universal Credit for All Intelligence',
    description: 'The first credit infrastructure for both humans and AI agents on Solana.',
    creator: '@obsidiancredit',
    site: '@obsidiancredit',
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://obsidian.credit',
  },
  appleWebApp: {
    title: 'Obsidian',
    capable: true,
    statusBarStyle: 'default',
  },
}

const links: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'Human Credit', path: '/human' },
  { label: 'Agent Credit', path: '/agent' },
  { label: 'Manifesto', path: '/manifesto' },
  { label: 'Account', path: '/account' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <DevelopmentBanner />
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}

// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
