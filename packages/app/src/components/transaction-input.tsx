'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Loader2 } from 'lucide-react'
import { isValidSignature } from '@/lib/solana/parser'

interface TransactionInputProps {
  onAnalyze?: (signature: string) => void
}

export function TransactionInput({ onAnalyze }: TransactionInputProps) {
  const [signature, setSignature] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate signature
    if (!signature.trim()) {
      setError('Please enter a transaction signature')
      return
    }

    if (!isValidSignature(signature.trim())) {
      setError('Invalid transaction signature format. Should be 87-88 base58 characters.')
      return
    }

    setIsLoading(true)

    try {
      // Call parent callback if provided
      if (onAnalyze) {
        await onAnalyze(signature.trim())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze transaction')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Transaction</CardTitle>
        <CardDescription>Paste a failed Solana transaction signature to get instant error analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature">Transaction Signature</Label>
            <div className="flex gap-2">
              <Input
                id="signature"
                placeholder="e.g., 5J7W8n..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
              />
              <Button type="submit" disabled={isLoading} size="icon">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Supports mainnet, devnet, and testnet transactions</span>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-2">Example signatures to try:</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                setSignature('5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW')
              }
              className="text-xs text-blue-600 hover:underline block"
            >
              Sample failed transaction
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
