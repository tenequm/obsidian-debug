import { Mail, Twitter } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { ReactQueryProvider } from "@/components/react-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Obsidian Debug - Solana Transaction Debugger",
  description:
    "AI-powered transaction error analysis for Solana developers. Turn cryptic errors into instant fixes. Debug failed transactions in seconds, not hours.",
  keywords: [
    "Solana",
    "debugger",
    "transaction errors",
    "developer tools",
    "Obsidian Debug",
    "Solana debugging",
    "transaction analysis",
    "error analysis",
    "Colosseum Cypherpunk",
  ],
  authors: [{ name: "Obsidian Debug Team" }],
  creator: "Obsidian Debug",
  publisher: "Obsidian Debug",
  metadataBase: new URL("https://obsidian.credit"),
  openGraph: {
    title: "Obsidian Debug - Solana Transaction Debugger",
    description:
      "AI-powered transaction error analysis. Instantly understand why Solana transactions fail and get actionable fixes.",
    url: "https://obsidian.credit",
    siteName: "Obsidian Debug",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Obsidian Debug - Solana Transaction Debugger",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Debug - Solana Transaction Debugger",
    description:
      "AI-powered transaction error analysis for Solana developers. 30 minutes → 30 seconds.",
    creator: "@obsidiancredit",
    site: "@obsidiancredit",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://obsidian.credit",
  },
  appleWebApp: {
    title: "Obsidian Debug",
    capable: true,
    statusBarStyle: "default",
  },
};

function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-center md:text-left">
            <p className="font-semibold text-sm">© 2025 Obsidian Debug</p>
            <p className="mt-1 text-muted-foreground text-xs">
              AI-powered Solana transaction debugger
            </p>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link className="transition-colors hover:text-primary" href="/">
              Home
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const links = [{ label: "Home", path: "/" }];

  return (
    <html className="dark" lang="en">
      <body className="antialiased">
        <ReactQueryProvider>
          <div className="dark flex min-h-screen flex-col">
            <Header links={links} />
            <main className="container mx-auto grow p-4">{children}</main>
            <Footer />
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
