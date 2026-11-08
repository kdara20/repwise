import Link from "next/link";

import { TrainerCard } from "@/components/trainers/trainer-card";
import { getFeaturedTrainers } from "@/lib/data/trainers";

/** Cached via getFeaturedTrainers; renders nothing until trainers exist. */
export async function FeaturedTrainers() {
  const trainers = await getFeaturedTrainers(3);
  if (trainers.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16" aria-labelledby="featured-heading">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="featured-heading" className="font-heading text-2xl font-semibold tracking-tight">
          Featured trainers
        </h2>
        <Link href="/trainers" className="text-sm text-muted-foreground hover:text-foreground">
          See all →
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <li key={trainer.slug} className="flex">
            <TrainerCard trainer={trainer} />
          </li>
        ))}
      </ul>
    </section>
  );
}
