"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
        >
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {NAV_LINKS.map((link) => (
            <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
              {link.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
