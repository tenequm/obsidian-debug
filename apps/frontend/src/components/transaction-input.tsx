"use client";

import { isValidSignature } from "@obsidian-debug/solana-errors";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TransactionInputProps = {
  onAnalyze?: (signature: string) => void;
};

export function TransactionInput({ onAnalyze }: TransactionInputProps) {
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate signature
    if (!signature.trim()) {
      setError("Please enter a transaction signature");
      return;
    }

    if (!isValidSignature(signature.trim())) {
      setError(
        "Invalid transaction signature format. Should be 87-88 base58 characters."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call parent callback if provided
      if (onAnalyze) {
        await onAnalyze(signature.trim());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Debug Transaction</CardTitle>
        <CardDescription>
          Paste a failed Solana transaction signature to get instant error
          analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="signature">Transaction Signature</Label>
            <div className="flex gap-2">
              <Input
                className="font-mono text-sm"
                disabled={isLoading}
                id="signature"
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g., 5J7W8n..."
                value={signature}
              />
              <Button disabled={isLoading} size="icon" type="submit">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span>Supports mainnet, devnet, and testnet transactions</span>
          </div>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="mb-2 text-muted-foreground text-sm">
            Example signatures to try:
          </p>
          <div className="space-y-1">
            <button
              className="block text-blue-600 text-xs hover:underline"
              onClick={() =>
                setSignature(
                  "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW"
                )
              }
              type="button"
            >
              Sample failed transaction
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
