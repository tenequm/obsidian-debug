import { Bug, Info } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="container mx-auto max-w-4xl space-y-8 px-4 py-16">
          <div className="space-y-6 text-center">
            <h1 className="font-bold text-5xl">Welcome to Obsidian Debug</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              AI-powered Solana transaction debugger that turns cryptic errors
              into instant fixes. Debug failed transactions in seconds, not
              hours.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                    <Bug className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="font-semibold text-xl">Debug Transaction</h2>
                </div>
                <p className="text-muted-foreground">
                  Paste a failed transaction signature and get AI-powered error
                  analysis with actionable fixes.
                </p>
                <Button asChild className="w-full">
                  <Link href="/debug">Start Debugging</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Info className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="font-semibold text-xl">Learn More</h2>
                </div>
                <p className="text-muted-foreground">
                  Discover how Obsidian Debug works and why it was built for the
                  Solana developer community.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/about">About This Project</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/50 p-8 text-center">
            <h3 className="font-semibold text-xl">Quick Start</h3>
            <p className="text-muted-foreground">
              Head to the Debug page, paste any failed Solana transaction
              signature from Solscan or SolanaFM, and let our AI analyze it for
              you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
