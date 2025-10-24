import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
          <div className="space-y-4">
            <h1 className="font-bold text-4xl">About Obsidian Debug</h1>
            <p className="text-lg text-muted-foreground">
              AI-powered Solana transaction debugger built for developers who
              value their time.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <h2 className="font-semibold text-2xl">What We Do</h2>
                <p className="text-muted-foreground">
                  Obsidian Debug transforms cryptic Solana transaction errors
                  into clear, actionable fixes. We leverage AI to analyze failed
                  transactions, parse error logs, and provide instant solutions
                  — turning what used to take 30 minutes into 30 seconds.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-2xl">The Problem</h2>
                <p className="text-muted-foreground">
                  Solana developers spend countless hours debugging failed
                  transactions. Error messages are often cryptic, stack traces
                  are hard to parse, and finding the root cause requires deep
                  protocol knowledge. With over 800 million failed transactions
                  annually, this represents massive developer productivity loss.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-2xl">Our Solution</h2>
                <p className="text-muted-foreground">
                  Simply paste a transaction signature from Solscan or SolanaFM.
                  Our AI parses the transaction data, identifies the error
                  pattern, cross-references with our knowledge base of common
                  issues, and provides step-by-step fixes with code examples.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-2xl">Built For</h2>
                <p className="text-muted-foreground">
                  This project was created for the{" "}
                  <a
                    className="font-semibold text-primary transition-colors hover:underline"
                    href="https://www.colosseum.org/cypherpunk"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Colosseum Cypherpunk Hackathon 2025
                  </a>
                  , demonstrating how AI can dramatically improve developer
                  experience in the Solana ecosystem.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 text-center">
            <h3 className="font-semibold text-xl">Get In Touch</h3>
            <div className="flex justify-center gap-6">
              <a
                className="text-primary transition-colors hover:underline"
                href="https://x.com/obsidiandebug"
                rel="noopener noreferrer"
                target="_blank"
              >
                Twitter
              </a>
              <a
                className="text-primary transition-colors hover:underline"
                href="mailto:hello@soldebug.dev"
              >
                Email
              </a>
              <a
                className="text-primary transition-colors hover:underline"
                href="https://github.com/tenequm/obsidian-debug"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
