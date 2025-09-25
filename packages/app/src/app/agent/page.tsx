'use client'

import { AppHero } from '@/components/app-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Activity, TrendingUp, Bot, Loader2 } from 'lucide-react'
import { generateMockAgentMetrics } from '@/lib/test-data'
import { isDevelopmentMode } from '@/lib/development-mode'
import { useRouter } from 'next/navigation'
import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'

export default function AgentCreditPage() {
  const router = useRouter()
  const { account } = useSolana()
  const [analyzeState, setAnalyzeState] = useState<'idle' | 'analyzing' | 'complete'>('idle')
  const [agentMetrics, setAgentMetrics] = useState<ReturnType<typeof generateMockAgentMetrics> | null>(null)

  const handleAnalyzePerformance = async () => {
    setAnalyzeState('analyzing')

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const metrics = generateMockAgentMetrics(account?.address.toString())
    setAgentMetrics(metrics)
    setAnalyzeState('complete')
  }

  const handleRequestLoan = () => {
    router.push('/loan/new?type=agent&score=' + agentMetrics?.creditScore)
  }

  const frameworkColors = {
    ElizaOS: 'text-blue-600 dark:text-blue-400',
    AI16Z: 'text-purple-600 dark:text-purple-400',
    Custom: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero
        title="AI Agent Credit Assessment"
        subtitle="Connect your agent wallet to analyze on-chain performance"
      />

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
        {!account && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Agent Wallet</CardTitle>
              <CardDescription>
                Connect your AI agent&apos;s wallet to analyze on-chain performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-4">Connect your agent wallet to continue</p>
                <WalletDropdown />
              </div>
            </CardContent>
          </Card>
        )}

        {account && analyzeState === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>Agent Wallet Connected</CardTitle>
              <CardDescription>
                Wallet: {account.address.toString().slice(0, 4)}...{account.address.toString().slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Ready to Analyze</p>
                  <p className="text-xs text-muted-foreground">We&apos;ll analyze your on-chain metrics including:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Total revenue generated</li>
                    <li>• Transaction success rate</li>
                    <li>• Operational history</li>
                    <li>• Framework compatibility</li>
                  </ul>
                </div>
                <Button onClick={handleAnalyzePerformance} className="w-full" size="lg">
                  <Activity className="mr-2 h-4 w-4" />
                  Analyze Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {analyzeState === 'analyzing' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <p className="text-lg font-medium">Analyzing on-chain performance...</p>
                <p className="text-sm text-muted-foreground mt-2">Scanning transaction history and computing metrics</p>
              </div>
            </CardContent>
          </Card>
        )}

        {analyzeState === 'complete' && agentMetrics && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Agent Credit Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">{agentMetrics.creditScore}</div>
                  <p className="text-lg text-muted-foreground">AI Agent Performance Score</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-semibold">${agentMetrics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-xl font-semibold">{agentMetrics.successRate}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Operational Days</p>
                    <p className="text-xl font-semibold">{agentMetrics.operationalDays}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Framework</p>
                    <p className={`text-xl font-semibold ${frameworkColors[agentMetrics.framework]}`}>
                      {agentMetrics.framework}
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">0% Collateral Required</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI agents qualify for zero-collateral loans based on performance
                    </p>
                  </div>

                  <Button onClick={handleRequestLoan} className="w-full" size="lg">
                    Request Agent Loan
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
