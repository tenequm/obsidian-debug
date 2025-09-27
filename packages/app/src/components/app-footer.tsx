import Link from 'next/link'
import { Twitter, Mail } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="bg-card/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="font-semibold text-sm">© 2025 Obsidian Protocol</p>
            <p className="text-xs text-muted-foreground mt-1">
              Universal Credit for All Intelligence
            </p>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/manifesto" className="hover:text-primary transition-colors">
              Manifesto
            </Link>
            <a
              href="https://x.com/obsidiancredit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Twitter className="h-3 w-3" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
            <a
              href="mailto:hello@obsidian.credit"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Contact</span>
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              Built for{' '}
              <a
                href="https://www.colosseum.org/cypherpunk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-primary transition-colors"
              >
                Colosseum Cypherpunk
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
