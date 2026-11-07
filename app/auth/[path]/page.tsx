import { viewPaths } from "@better-auth-ui/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Auth } from "@/components/auth/auth";

const validAuthPaths = new Set<string>(Object.values(viewPaths.auth));

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return [...validAuthPaths].map((path) => ({ path }));
}

export default async function AuthPage({ params }: PageProps<"/auth/[path]">) {
  const { path } = await params;
  if (!validAuthPaths.has(path)) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md grow flex-col items-center justify-center p-4">
      <Auth path={path} />
    </main>
  );
}
