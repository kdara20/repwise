import { SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProvinceSelect, SpecialtySelect } from "@/components/forms/trainer-fields";
import { TrainerCard } from "@/components/trainers/trainer-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { searchTrainers, type TrainerSearch } from "@/lib/data/trainers";
import { parseTrainerSearch, trainerSearchHref } from "@/lib/validation/search";

export const metadata: Metadata = {
  title: "Find a personal trainer",
  description:
    "Browse vetted personal trainers across Canada. Filter by specialty and province.",
  alternates: { canonical: "/trainers" },
};

export default function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Find a personal trainer
        </h1>
        <p className="text-muted-foreground">Vetted coaches across Canada.</p>
      </header>
      <Suspense fallback={<DirectorySkeleton />}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Directory({ searchParams }: Pick<PageProps<"/trainers">, "searchParams">) {
  const search = parseTrainerSearch(await searchParams);
  const { items, total, pageCount } = await searchTrainers(search);
  const filtered = Boolean(search.q || search.specialty || search.province);

  return (
    <>
      <SearchForm search={search} />
      <section aria-labelledby="results-heading" className="flex flex-col gap-4">
        <h2 id="results-heading" className="text-sm text-muted-foreground" aria-live="polite">
          {total === 1 ? "1 trainer" : `${total} trainers`}
          {filtered && (total === 1 ? " matches your search" : " match your search")}
        </h2>
        {items.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((trainer) => (
              <li key={trainer.slug} className="flex">
                <TrainerCard trainer={trainer} />
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 && <Pagination search={search} pageCount={pageCount} />}
      </section>
    </>
  );
}

/** Plain GET form: works without JS, and the URL stays shareable. */
function SearchForm({ search }: { search: TrainerSearch }) {
  return (
    <form
      action="/trainers"
      role="search"
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_12rem_12rem_auto] sm:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          type="search"
          maxLength={100}
          defaultValue={search.q}
          placeholder="Name, goal, or style — e.g. kettlebell"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialty">Specialty</Label>
        <SpecialtySelect defaultValue={search.specialty} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="province">Province</Label>
        <ProvinceSelect defaultValue={search.province} placeholder="All of Canada" />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
      <SearchXIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">
        {filtered ? "No trainers match those filters" : "No trainers yet"}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {filtered
          ? "Try a broader search or a different province."
          : "We're onboarding our first coaches. Check back soon — or apply to be one."}
      </p>
      {filtered ? (
        <Link href="/trainers" className={buttonVariants({ variant: "outline" })}>
          Clear filters
        </Link>
      ) : (
        <Link href="/apply" className={buttonVariants({ variant: "outline" })}>
          Become a trainer
        </Link>
      )}
    </div>
  );
}

function Pagination({ search, pageCount }: { search: TrainerSearch; pageCount: number }) {
  const { page } = search;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-2">
      {page > 1 ? (
        <Link
          href={trainerSearchHref({ ...search, page: page - 1 })}
          className={buttonVariants({ variant: "outline" })}
          rel="prev"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={trainerSearchHref({ ...search, page: page + 1 })}
          className={buttonVariants({ variant: "outline" })}
          rel="next"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function DirectorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}
