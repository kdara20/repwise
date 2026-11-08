import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PROVINCES, SPECIALTY_LABELS, type Province, type Specialty } from "@/lib/constants";
import type { PublicTrainer } from "@/lib/data/trainers";
import { TrainerAvatar } from "./trainer-avatar";

export function formatLocation(city: string | null, province: string | null): string | null {
  const prov = province ? PROVINCES[province as Province] : null;
  return [city, prov].filter(Boolean).join(", ") || null;
}

export function TrainerCard({ trainer }: { trainer: PublicTrainer }) {
  const location = formatLocation(trainer.city, trainer.province);

  return (
    <Link
      href={`/trainers/${trainer.slug}`}
      className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <TrainerAvatar name={trainer.displayName} imageUrl={trainer.imageUrl} />
        <div className="min-w-0">
          <h3 className="truncate font-heading font-medium group-hover:underline">
            {trainer.displayName}
          </h3>
          {location && <p className="truncate text-sm text-muted-foreground">{location}</p>}
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-pretty">{trainer.headline}</p>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {trainer.specialties.slice(0, 3).map((s) => (
          <Badge key={s} variant="secondary">
            {SPECIALTY_LABELS[s as Specialty] ?? s}
          </Badge>
        ))}
        {!trainer.acceptingClients && <Badge variant="outline">Waitlist</Badge>}
      </div>
    </Link>
  );
}
