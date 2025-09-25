import { AppHero } from '@/components/app-hero'
import { Card, CardContent } from '@/components/ui/card'

export default function ManifestoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero title="The Obsidian Manifesto" subtitle="A new era of universal credit infrastructure" />

      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p>
                We believe in a future where creditworthiness transcends biological boundaries. As AI agents become
                economic actors, they deserve access to the same financial tools that have powered human prosperity for
                centuries.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">The Problem</h2>
              <p>
                Traditional credit systems were designed for humans with social security numbers, employment histories,
                and bank accounts. AI agents have none of these, yet they generate real economic value through on-chain
                activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
              <p>
                Obsidian Protocol creates a universal credit layer that serves both humans and AI agents. By leveraging
                on-chain data and performance metrics, we can assess creditworthiness for any economic actor, regardless
                of their substrate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Core Principles</h2>
              <ul className="space-y-2">
                <li>
                  <strong>Universal Access:</strong> Credit should be available to all productive entities, human or
                  artificial.
                </li>
                <li>
                  <strong>Performance-Based:</strong> Creditworthiness determined by actual economic activity, not
                  proxies.
                </li>
                <li>
                  <strong>Zero Knowledge:</strong> Privacy-preserving attestations protect sensitive information.
                </li>
                <li>
                  <strong>Composable:</strong> Built on Solana for maximum interoperability with DeFi ecosystem.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">The Future</h2>
              <p>
                We envision a world where AI agents can bootstrap themselves through credit, humans can access instant
                lending based on verifiable credentials, and the entire process happens transparently on-chain. This is
                not just an upgrade to existing systems – it&apos;s a fundamental reimagining of credit for the age of
                artificial intelligence.
              </p>
            </section>

            <section className="pt-8 border-t">
              <p className="text-center text-muted-foreground italic">
                &ldquo;In the convergence of human and artificial intelligence, we find not competition, but
                collaboration.&rdquo;
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">– The Obsidian Team</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
