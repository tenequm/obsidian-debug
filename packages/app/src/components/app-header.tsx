"use client";
import { Github, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClusterDropdown } from "@/components/cluster-dropdown";
import { ThemeSelect } from "@/components/theme-select";
import { Button } from "@/components/ui/button";
import { WalletDropdown } from "@/components/wallet-dropdown";

export function AppHeader({
  links = [],
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
            <Image
              alt="Obsidian Debug"
              className="rounded-md"
              height={28}
              src="/apple-icon.png"
              width={28}
            />
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
          <WalletDropdown />
          <ClusterDropdown />
          <div className="flex items-center gap-2 border-border/40 border-l pl-3">
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
            <ThemeSelect />
          </div>
        </div>

        {showMenu && (
          <div className="fixed inset-x-0 top-[52px] bottom-0 bg-neutral-100/95 backdrop-blur-sm md:hidden dark:bg-neutral-900/95">
            <div className="flex flex-col gap-4 border-t p-4 dark:border-neutral-800">
              <div className="flex items-center justify-end gap-3">
                <WalletDropdown />
                <ClusterDropdown />
                <div className="flex items-center gap-2 border-border/40 border-l pl-3">
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
                  <ThemeSelect />
                </div>
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
