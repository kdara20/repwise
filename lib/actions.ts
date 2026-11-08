import { z } from "zod";

/** Return shape for every Server Action used with useActionState. */
export type ActionState<V = Record<string, unknown>> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /**
   * The submitted values, echoed back on failure. React 19 resets a form after
   * its action runs, so forms use these as defaultValues to keep user input.
   */
  values?: V;
};

export const initialActionState: ActionState = { ok: false };

export function invalid<V>(error: z.ZodError, values?: V): ActionState<V> {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as ActionState["fieldErrors"],
    values,
  };
}

/** Optional text input: empty string → undefined. */
export function optionalText(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Native checkbox: present ("on") when checked. */
export function checked(formData: FormData, name: string): boolean {
  return formData.get(name) !== null;
}

export function list(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string");
}

/** Postgres unique_violation, optionally for a specific constraint. */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  const pgError = (error as { cause?: unknown })?.cause ?? error;
  const { code, constraint: name } = (pgError ?? {}) as { code?: string; constraint?: string };
  return code === "23505" && (!constraint || name === constraint);
}
