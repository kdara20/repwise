import { viewPaths } from "@better-auth-ui/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Settings } from "@/components/auth/settings/settings";

const validSettingsPaths = new Set<string>(Object.values(viewPaths.settings));

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export function generateStaticParams() {
  return [...validSettingsPaths].map((path) => ({ path }));
}

export default async function SettingsPage({
  params,
}: PageProps<"/settings/[path]">) {
  const { path } = await params;
  if (!validSettingsPaths.has(path)) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <Settings path={path} />
    </main>
  );
}
