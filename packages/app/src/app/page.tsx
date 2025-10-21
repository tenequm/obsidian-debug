"use client";

import { Brain, Bug, TrendingUp, Zap } from "lucide-react";
import { AppHero } from "@/components/app-hero";
import { TransactionInput } from "@/components/transaction-input";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const handleAnalyze = async () => {
    // This will call the API route to analyze the transaction
  };

  return (
    <div className="container mx-auto px-4">
      <AppHero
        subtitle="AI-powered error analysis that turns cryptic Solana errors into actionable fixes. 30 minutes → 30 seconds."
        title="Debug Solana Transactions Instantly"
      />

      <div className="mx-auto max-w-6xl space-y-12">
        {/* Main Input */}
        <TransactionInput onAnalyze={handleAnalyze} />

        {/* Value Props */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Bug className="mx-auto mb-3 h-8 w-8 text-red-500" />
              <p className="font-semibold">Error Translation</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Turn cryptic codes into plain English
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
              <p className="font-semibold">Instant Analysis</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Get fixes in seconds, not hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto mb-3 h-8 w-8 text-purple-500" />
              <p className="font-semibold">AI-Powered</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Claude analyzes every error
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-blue-500" />
              <p className="font-semibold">Pattern Learning</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Built-in library of common errors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats (Placeholder) */}
        <div className="rounded-lg bg-muted/50 p-8 text-center">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="font-bold text-3xl text-primary">800M+</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Failed transactions annually
              </p>
            </div>
            <div>
              <p className="font-bold text-3xl text-primary">30 min</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Average time debugging manually
              </p>
            </div>
            <div>
              <p className="font-bold text-3xl text-primary">30 sec</p>
              <p className="mt-1 text-muted-foreground text-sm">
                With Obsidian Debug analysis
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <h2 className="text-center font-bold text-3xl">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                1
              </div>
              <h3 className="font-semibold">Paste Transaction</h3>
              <p className="text-muted-foreground text-sm">
                Copy any failed transaction signature from Solscan or SolanaFM
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                2
              </div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Our AI parses logs, identifies the error, and cross-references
                patterns
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                3
              </div>
              <h3 className="font-semibold">Get Fixes</h3>
              <p className="text-muted-foreground text-sm">
                Receive step-by-step instructions and code examples to fix the
                issue
              </p>
            </div>
          </div>
        </div>

        {/* Supported Protocols */}
        <div className="space-y-4 text-center">
          <h3 className="font-semibold text-xl">
            Supports Major Solana Protocols
          </h3>
          <p className="text-muted-foreground">
            Token Program • System Program • Jupiter • Raydium • Orca • Metaplex
            • More coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
