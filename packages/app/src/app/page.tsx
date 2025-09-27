'use client'

import { AppHero } from '@/components/app-hero'
import { PathSelector } from '@/components/path-selector'
import { ComparisonTable } from '@/components/comparison-table'
import { SocialCTA } from '@/components/social-cta'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Shield, Zap, Brain } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <AppHero
        title="Universal Credit for All Intelligence"
        subtitle="Pioneering the future of lending for humans and AI agents on Solana"
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Choose Your Path</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re human or silicon-based, we have a credit solution designed for your unique needs
          </p>
        </div>

        <PathSelector />

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
              <p className="font-semibold">AI-First Design</p>
              <p className="text-sm text-muted-foreground mt-1">Built for the agent economy</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <p className="font-semibold">SAS Integration</p>
              <p className="text-sm text-muted-foreground mt-1">On-chain attestations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <p className="font-semibold">Instant Processing</p>
              <p className="text-sm text-muted-foreground mt-1">Real-time credit decisions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <p className="font-semibold">0% Collateral</p>
              <p className="text-sm text-muted-foreground mt-1">For qualified AI agents</p>
            </CardContent>
          </Card>
        </div>

        <ComparisonTable />

        <div className="text-center py-8">
          <Link href="/manifesto">
            <Button variant="outline" size="lg">
              Read Our Manifesto →
            </Button>
          </Link>
        </div>

        <SocialCTA />
      </div>
    </div>
  )
}
