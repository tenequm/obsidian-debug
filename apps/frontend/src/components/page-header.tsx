import { Github, Twitter } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="flex items-center gap-1 px-4">
        <Button
          aria-label="View GitHub repository"
          asChild
          className="size-9"
          size="icon"
          variant="ghost"
        >
          <Link
            href="https://github.com/tenequm/obsidian-debug"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="size-4" />
          </Link>
        </Button>
        <Button
          aria-label="Follow us on Twitter"
          asChild
          className="size-9"
          size="icon"
          variant="ghost"
        >
          <Link
            href="https://x.com/obsidiandebug"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Twitter className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
