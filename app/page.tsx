import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { FeaturedTrainers } from "./featured-trainers";

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28">
        <p className="text-sm font-medium text-muted-foreground">
          Personal training, made in Canada
        </p>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Train with a certified coach who knows your goals.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
          Find a vetted trainer, follow their programs, message them directly,
          and book 1:1 video sessions — all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/trainers" className={buttonVariants({ size: "lg" })}>
            Find a trainer
          </Link>
          <Link
            href="/apply"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Become a trainer
          </Link>
        </div>
      </section>

      <Suspense>
        <FeaturedTrainers />
      </Suspense>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            {
              title: "Vetted coaches",
              body: "Every trainer is reviewed for certifications before they appear on Repwise.",
            },
            {
              title: "Programs + video",
              body: "Subscribe to a trainer to unlock all of their structured programs and lessons.",
            },
            {
              title: "1:1 coaching",
              body: "Chat with your trainer and book private video sessions on your schedule.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-medium">{item.title}</h2>
              <p className="text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
