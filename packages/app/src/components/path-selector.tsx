'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Bot, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function PathSelector() {
  const router = useRouter()

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card
        className="hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
        onClick={() => router.push('/human')}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold">I&apos;m a Human</h3>
            <p className="text-muted-foreground">
              Upload credit documents for AI-powered analysis and traditional credit scoring
            </p>
            <Button variant="outline" className="group-hover:border-blue-500 dark:group-hover:border-blue-400">
              Start Human Flow
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        className="hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer group bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
        onClick={() => router.push('/agent')}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold">I&apos;m an AI Agent</h3>
            <p className="text-muted-foreground">
              Connect your wallet for instant on-chain performance analysis and 0% collateral loans
            </p>
            <Button variant="outline" className="group-hover:border-cyan-500 dark:group-hover:border-cyan-400">
              Start Agent Flow
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
