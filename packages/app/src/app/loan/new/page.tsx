'use client'

import { Suspense } from 'react'
import { AppHero } from '@/components/app-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { isDevelopmentMode } from '@/lib/development-mode'
import { Check, AlertCircle } from 'lucide-react'
import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { toast } from 'sonner'

function LoanPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { account } = useSolana()

  const entityType = searchParams.get('type') || 'human'
  const creditScore = searchParams.get('score') || '700'

  const [loanAmount, setLoanAmount] = useState('')
  const [loanPurpose, setLoanPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isAgent = entityType === 'agent'
  const maxLoan = isAgent ? 100000 : 50000
  const collateralRequired = isAgent ? 0 : Math.floor(Number(loanAmount) * 0.1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    setSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (isDevelopmentMode()) {
      toast.success('Test loan request submitted successfully!')
      setSubmitted(true)
    } else {
      toast.error('Production loan processing not yet implemented')
    }

    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AppHero title="Loan Request Submitted" subtitle="Your application is being processed" />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">Application Received</h3>
                <p className="text-muted-foreground">
                  Loan ID: #{Math.random().toString(36).substring(2, 9).toUpperCase()}
                </p>
                <div className="pt-4 space-y-2">
                  <p className="text-sm">Amount Requested: ${loanAmount}</p>
                  <p className="text-sm">Credit Score: {creditScore}</p>
                  <p className="text-sm">Entity Type: {entityType}</p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => router.push('/')} variant="outline">
                    Return Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero title="Request a Loan" subtitle={`${isAgent ? 'AI Agent' : 'Human'} loan application`} />

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Credit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Credit Score</p>
                <p className="text-xl font-semibold">{creditScore}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Entity Type</p>
                <p className="text-xl font-semibold capitalize">{entityType}</p>
              </div>
            </div>

            {isAgent && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">0% Collateral Required</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!account ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet to Continue</CardTitle>
              <CardDescription>You need to connect your wallet to submit a loan application</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletDropdown />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Maximum loan amount: ${maxLoan.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Loan Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    max={maxLoan}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Maximum: ${maxLoan.toLocaleString()}</p>
                </div>

                <div>
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder={isAgent ? 'e.g., Infrastructure scaling' : 'e.g., Business expansion'}
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    required
                  />
                </div>

                {loanAmount && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Loan Amount:</span>
                          <span className="font-semibold">${Number(loanAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collateral Required:</span>
                          <span className="font-semibold">
                            ${collateralRequired.toLocaleString()} ({isAgent ? '0' : '10'}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest Rate:</span>
                          <span className="font-semibold">{isAgent ? '5%' : '7%'} APR</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loan Term:</span>
                          <span className="font-semibold">90 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isDevelopmentMode() && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Production loans require development mode. Add ?dev=true to URL.
                      </p>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting || !loanAmount || !loanPurpose}>
                  {submitting ? 'Submitting...' : 'Submit Loan Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function NewLoanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoanPageContent />
    </Suspense>
  )
}
