'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react'
import type { ErrorAnalysis } from '@/lib/claude'

interface ErrorAnalysisDisplayProps {
  analysis: ErrorAnalysis
  signature: string
}

export function ErrorAnalysisDisplay({ analysis, signature }: ErrorAnalysisDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Transaction Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Transaction Failed
          </CardTitle>
          <CardDescription className="font-mono text-xs break-all">{signature}</CardDescription>
        </CardHeader>
      </Card>

      {/* Error Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Error Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Root Cause */}
      <Card>
        <CardHeader>
          <CardTitle>Root Cause</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{analysis.rootCause}</p>
        </CardContent>
      </Card>

      {/* Fix Steps */}
      <Card>
        <CardHeader>
          <CardTitle>How to Fix</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {analysis.fixSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Code Example (if available) */}
      {analysis.codeExample && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Code Example</CardTitle>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis.codeExample || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{analysis.codeExample}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Analysis complete! Follow the steps above to fix your transaction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
