import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {SITE_NAME} · Personal trainers across Canada
        </p>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href="/trainers" className="hover:text-foreground">
            Trainers
          </Link>
          <Link href="/apply" className="hover:text-foreground">
            Become a trainer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
