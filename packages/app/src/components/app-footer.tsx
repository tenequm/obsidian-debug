import { Mail, Twitter } from "lucide-react";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-center md:text-left">
            <p className="font-semibold text-sm">© 2025 Obsidian Protocol</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Universal Credit for All Intelligence
            </p>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link className="transition-colors hover:text-primary" href="/">
              Home
            </Link>
            <Link
              className="transition-colors hover:text-primary"
              href="/manifesto"
            >
              Manifesto
            </Link>
            <a
              className="flex items-center gap-1 transition-colors hover:text-primary"
              href="https://x.com/obsidiancredit"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Twitter className="h-3 w-3" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
            <a
              className="flex items-center gap-1 transition-colors hover:text-primary"
              href="mailto:hello@obsidian.credit"
            >
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Contact</span>
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-xs">
              Built for{" "}
              <a
                className="font-semibold transition-colors hover:text-primary"
                href="https://www.colosseum.org/cypherpunk"
                rel="noopener noreferrer"
                target="_blank"
              >
                Colosseum Cypherpunk
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
