import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Twitter, Mail, Sparkles } from 'lucide-react'

export function SocialCTA() {
  return (
    <div className="w-full py-16 px-4">
      <Card className="max-w-3xl mx-auto bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border-purple-500/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-500" />
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Interested in Obsidian Protocol?
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join the revolution in universal credit infrastructure. Follow our development and be part of the future of lending.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="default"
              size="lg"
              className="group"
              onClick={() => window.open('https://x.com/obsidiancredit', '_blank')}
            >
              <Twitter className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Follow development: @obsidiancredit
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group"
              onClick={() => window.location.href = 'mailto:hello@obsidian.credit'}
            >
              <Mail className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              hello@obsidian.credit
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Built for the <span className="font-semibold text-purple-600 dark:text-purple-400">Colosseum Cypherpunk</span> Hackathon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}