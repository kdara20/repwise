import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import type { ActionState } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** Form-level result message. Announced to screen readers when it changes. */
export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (!state.message) return null;
  const Icon = state.ok ? CircleCheckIcon : CircleAlertIcon;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "flex items-center gap-2 text-sm",
        state.ok ? "text-emerald-700 dark:text-emerald-400" : "text-destructive",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" />
      {state.message}
    </p>
  );
}

export function fieldError(state: ActionState, name: string) {
  return state.fieldErrors?.[name]?.map((message) => ({ message }));
}
