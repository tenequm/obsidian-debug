import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="dark" lang="en">
      <body className="antialiased">
        <ReactQueryProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
