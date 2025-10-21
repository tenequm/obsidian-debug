"use client";

import { Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ObsidianLogo } from "@/components/obsidian-logo";
import { Button } from "@/components/ui/button";

export function Header({
  links,
}: {
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  function isActive(path: string) {
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  }

  return (
    <header className="relative z-50 border-border/40 border-b bg-card/50 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            href="/"
          >
            <ObsidianLogo className="h-7 w-7" variant="symbol" />
            <span className="hidden font-medium text-lg tracking-tight sm:block">
              Obsidian Debug
            </span>
          </Link>
          <div className="hidden items-center md:flex">
            <ul className="flex flex-nowrap items-center gap-6">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={`font-medium text-sm transition-colors ${isActive(path) ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button
          className="md:hidden"
          onClick={() => setShowMenu(!showMenu)}
          size="icon"
          variant="ghost"
        >
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            className="h-8 w-8 hover:bg-accent"
            size="icon"
            variant="ghost"
          >
            <a
              aria-label="GitHub Repository"
              href="https://github.com/tenequm/obsidian-protocol"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {showMenu && (
          <div className="fixed inset-x-0 top-[52px] bottom-0 bg-neutral-900/95 backdrop-blur-sm md:hidden">
            <div className="flex flex-col gap-4 border-neutral-800 border-t p-4">
              <div className="flex items-center justify-end gap-3">
                <Button
                  asChild
                  className="h-8 w-8 hover:bg-accent"
                  size="icon"
                  variant="ghost"
                >
                  <a
                    aria-label="GitHub Repository"
                    href="https://github.com/tenequm/obsidian-protocol"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`block py-2 text-lg ${isActive(path) ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
