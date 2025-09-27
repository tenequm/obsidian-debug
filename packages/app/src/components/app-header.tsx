'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X, Github } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { ClusterDropdown } from '@/components/cluster-dropdown'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative z-50 px-6 py-4 bg-card/50 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" href="/">
            <Image
              src="/apple-icon.png"
              alt="Obsidian Protocol"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-lg font-medium tracking-tight hidden sm:block">Obsidian Protocol</span>
          </Link>
          <div className="hidden md:flex items-center">
            <ul className="flex gap-6 flex-nowrap items-center">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={`text-sm font-medium transition-colors ${isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    href={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className="hidden md:flex items-center gap-3">
          <WalletDropdown />
          <ClusterDropdown />
          <div className="flex items-center gap-2 pl-3 border-l border-border/40">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              asChild
            >
              <a
                href="https://github.com/tenequm/obsidian-protocol"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <ThemeSelect />
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800">
              <div className="flex justify-end items-center gap-3">
                <WalletDropdown />
                <ClusterDropdown />
                <div className="flex items-center gap-2 pl-3 border-l border-border/40">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent"
                    asChild
                  >
                    <a
                      href="https://github.com/tenequm/obsidian-protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub Repository"
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
                      className={`block text-lg py-2  ${isActive(path) ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground`}
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
  )
}
