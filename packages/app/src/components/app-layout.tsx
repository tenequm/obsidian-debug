"use client";

import type React from "react";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode;
  links: { label: string; path: string }[];
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <div className="flex min-h-screen flex-col">
        <AppHeader links={links} />
        <main className="container mx-auto grow p-4">{children}</main>
        <AppFooter />
      </div>
      <Toaster closeButton />
    </ThemeProvider>
  );
}
