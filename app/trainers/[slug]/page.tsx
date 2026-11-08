import { CalendarIcon, CheckIcon, MapPinIcon, MessageSquareIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrainerAvatar } from "@/components/trainers/trainer-avatar";
import { formatLocation } from "@/components/trainers/trainer-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SPECIALTY_LABELS, type Specialty } from "@/lib/constants";
import { getListedSlugs, getPublicTrainer, type PublicTrainer } from "@/lib/data/trainers";

/**
 * Prerenders every listed trainer; others render on first visit and are cached.
 * Cache Components requires at least one param, so fall back to a placeholder
 * (it fails the lookup below and serves a 404), as the Next.js docs recommend.
 */
export async function generateStaticParams() {
  const listed = await getListedSlugs();
  return listed.length ? listed.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/trainers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await getPublicTrainer(slug);
  if (!trainer) return { title: "Trainer not found", robots: { index: false } };

  const location = formatLocation(trainer.city, trainer.province);
  const title = location ? `${trainer.displayName} — Personal trainer in ${location}` : `${trainer.displayName} — Personal trainer`;
  const description = trainer.headline;
  return {
    title,
    description,
    alternates: { canonical: `/trainers/${trainer.slug}` },
    openGraph: {
      type: "profile",
      title: `${title} · ${SITE_NAME}`,
      description,
      url: `/trainers/${trainer.slug}`,
      ...(trainer.imageUrl && { images: [{ url: trainer.imageUrl, alt: trainer.displayName }] }),
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function TrainerPage({ params }: PageProps<"/trainers/[slug]">) {
  // Listed trainers are prerendered (generateStaticParams). For other slugs the app
  // shell streams first, so a miss renders not-found with `noindex` under a 200 —
  // the documented Partial Prerendering trade-off. getPublicTrainer is cached per slug.
  const { slug } = await params;
  const trainer = await getPublicTrainer(slug);
  if (!trainer) notFound();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <Link href="/trainers" className="text-sm text-muted-foreground hover:text-foreground">
        ← All trainers
      </Link>
      <TrainerProfile trainer={trainer} />
    </main>
  );
}

function TrainerProfile({ trainer }: { trainer: PublicTrainer }) {
  const location = formatLocation(trainer.city, trainer.province);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <TrainerAvatar
          name={trainer.displayName}
          imageUrl={trainer.imageUrl}
          className="size-24 text-2xl"
        />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {trainer.displayName}
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">{trainer.headline}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-4" /> {location}
              </span>
            )}
            {trainer.yearsExperience != null && (
              <span>
                {trainer.yearsExperience} {trainer.yearsExperience === 1 ? "year" : "years"} coaching
              </span>
            )}
            {trainer.acceptingClients ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckIcon className="size-4" /> Accepting new clients
              </span>
            ) : (
              <Badge variant="outline">Waitlist</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="mb-2 font-heading text-lg font-medium">About</h2>
            <p className="whitespace-pre-line text-pretty">{trainer.bio}</p>
          </div>
          <div>
            <h2 className="mb-2 font-heading text-lg font-medium">Specialties</h2>
            <ul className="flex flex-wrap gap-1.5">
              {trainer.specialties.map((s) => (
                <li key={s}>
                  <Badge variant="secondary">{SPECIALTY_LABELS[s as Specialty] ?? s}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Subscriptions, chat and booking ship in later phases. */}
        <aside className="flex h-fit flex-col gap-2 rounded-xl border p-4" aria-label="Work with this trainer">
          <Button disabled>Subscribe</Button>
          <Button variant="outline" disabled>
            <MessageSquareIcon /> Message
          </Button>
          <Button variant="outline" disabled>
            <CalendarIcon /> Book a session
          </Button>
          <p className="pt-1 text-center text-xs text-muted-foreground">Coming soon</p>
        </aside>
      </div>
    </article>
  );
}

