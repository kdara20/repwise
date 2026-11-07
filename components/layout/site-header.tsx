import Link from "next/link";

import { UserButton } from "@/components/auth/user/user-button";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { NAV_LINKS } from "./nav-links";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <MobileNav />
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserButton
            size="icon"
            variant="ghost"
            links={[
              { label: "Dashboard", href: "/dashboard", visibility: "authenticated" },
              { label: "Studio", href: "/studio/profile", visibility: "authenticated" },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
