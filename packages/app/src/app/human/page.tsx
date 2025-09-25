'use client'

import { AppHero } from '@/components/app-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { MOCK_CREDIT_ANALYSES } from '@/lib/test-data'
import { isDevelopmentMode } from '@/lib/development-mode'
import { useRouter } from 'next/navigation'

export default function HumanCreditPage() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle')
  const [creditScore, setCreditScore] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<typeof MOCK_CREDIT_ANALYSES.good | null>(null)

  const handleFileUpload = async () => {
    setUploadState('uploading')

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setUploadState('analyzing')

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockAnalysis = MOCK_CREDIT_ANALYSES.good
    setCreditScore(mockAnalysis.score)
    setAnalysis(mockAnalysis)
    setUploadState('complete')
  }

  const handleRequestLoan = () => {
    router.push('/loan/new?type=human&score=' + creditScore)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero title="Human Credit Assessment" subtitle="Upload your credit documents for AI-powered analysis" />

      {!isDevelopmentMode() && (
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <p className="text-sm">Development mode required for testing. Add ?dev=true to URL.</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {uploadState === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Credit Documents</CardTitle>
              <CardDescription>
                Upload your credit report, bank statements, or other financial documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={handleFileUpload}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload documents</p>
                <p className="text-sm text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadState === 'uploading' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
                <p className="text-lg font-medium">Uploading document...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadState === 'analyzing' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <p className="text-lg font-medium">AI analyzing your credit profile...</p>
                <p className="text-sm text-muted-foreground mt-2">This usually takes 10-30 seconds</p>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadState === 'complete' && analysis && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Credit Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">{creditScore}</div>
                  <p className="text-lg text-muted-foreground">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2 text-green-600 dark:text-green-400">Strengths</p>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.strengths.map((strength: string, i: number) => (
                      <li key={i} className="text-sm">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.risks.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Risk Factors</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.risks.map((risk: string, i: number) => (
                        <li key={i} className="text-sm">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Recommendation: <span className="font-semibold">{analysis.recommendation}</span>
                  </p>
                  <Button onClick={handleRequestLoan} className="w-full" size="lg">
                    Request Loan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
