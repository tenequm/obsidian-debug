'use client'

import { AppHero } from '@/components/app-hero'
import { TransactionInput } from '@/components/transaction-input'
import { Card, CardContent } from '@/components/ui/card'
import { Bug, Zap, Brain, TrendingUp } from 'lucide-react'

export default function Home() {
  const handleAnalyze = async (signature: string) => {
    // TODO: Implement analysis logic
    // This will call the API route to analyze the transaction
    console.log('Analyzing transaction:', signature)
  }

  return (
    <div className="container mx-auto px-4">
      <AppHero
        title="Debug Solana Transactions Instantly"
        subtitle="AI-powered error analysis that turns cryptic Solana errors into actionable fixes. 30 minutes → 30 seconds."
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Main Input */}
        <TransactionInput onAnalyze={handleAnalyze} />

        {/* Value Props */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Bug className="w-8 h-8 mx-auto mb-3 text-red-500" />
              <p className="font-semibold">Error Translation</p>
              <p className="text-sm text-muted-foreground mt-1">Turn cryptic codes into plain English</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
              <p className="font-semibold">Instant Analysis</p>
              <p className="text-sm text-muted-foreground mt-1">Get fixes in seconds, not hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <p className="font-semibold">AI-Powered</p>
              <p className="text-sm text-muted-foreground mt-1">Claude analyzes every error</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <p className="font-semibold">Pattern Learning</p>
              <p className="text-sm text-muted-foreground mt-1">Built-in library of common errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats (Placeholder) */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-primary">800M+</p>
              <p className="text-sm text-muted-foreground mt-1">Failed transactions annually</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">30 min</p>
              <p className="text-sm text-muted-foreground mt-1">Average time debugging manually</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">30 sec</p>
              <p className="text-sm text-muted-foreground mt-1">With Obsidian Debug analysis</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold">Paste Transaction</h3>
              <p className="text-sm text-muted-foreground">
                Copy any failed transaction signature from Solscan or SolanaFM
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI parses logs, identifies the error, and cross-references patterns
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold">Get Fixes</h3>
              <p className="text-sm text-muted-foreground">
                Receive step-by-step instructions and code examples to fix the issue
              </p>
            </div>
          </div>
        </div>

        {/* Supported Protocols */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Supports Major Solana Protocols</h3>
          <p className="text-muted-foreground">
            Token Program • System Program • Jupiter • Raydium • Orca • Metaplex • More coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
