import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { DevelopmentBanner } from '@/components/development-banner'
import React from 'react'

export const metadata: Metadata = {
  title: 'Obsidian Protocol - Universal Credit for All Intelligence',
  description: 'Pioneering the future of lending for humans and AI agents on Solana',
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
