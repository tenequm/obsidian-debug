"use client";

import { TransactionInput } from "@/components/transaction-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DebugPage() {
  const handleAnalyze = async () => {
    // This will call the API route to analyze the transaction
  };

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
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="flex flex-row justify-center py-[16px] md:py-[64px]">
            <div className="text-center">
              <div className="max-w-2xl">
                <h1 className="font-bold text-5xl">
                  Debug Solana Transactions Instantly
                </h1>
                <p className="pt-4 md:py-6">
                  AI-powered error analysis that turns cryptic Solana errors
                  into actionable fixes. 30 minutes → 30 seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl space-y-12">
            {/* Main Input */}
            <TransactionInput onAnalyze={handleAnalyze} />
          </div>
        </div>
      </div>
    </>
  );
}
