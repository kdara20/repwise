"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { invalid, text, type ActionState } from "@/lib/actions";
import {
  ApplicationNotPendingError,
  approveApplication,
  rejectApplication,
} from "@/lib/data/applications";
import { requireAdmin } from "@/lib/dal/session";

const idSchema = z.uuid();
const rejectSchema = z.object({
  id: idSchema,
  reason: z.string().trim().min(10, "Give the applicant a short reason (10+ characters)").max(500),
});

export async function approve(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireAdmin();
  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { ok: false, message: "Invalid application." };

  try {
    await approveApplication(id.data, user.id);
  } catch (error) {
    if (error instanceof ApplicationNotPendingError) {
      refresh();
      return { ok: false, message: error.message };
    }
    throw error;
  }
  refresh();
  return { ok: true, message: "Approved. The trainer can now set up their profile." };
}

export async function reject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireAdmin();
  const parsed = rejectSchema.safeParse({ id: text(formData, "id"), reason: text(formData, "reason") });
  if (!parsed.success) return invalid(parsed.error);

  try {
    await rejectApplication(parsed.data.id, user.id, parsed.data.reason);
  } catch (error) {
    if (error instanceof ApplicationNotPendingError) {
      refresh();
      return { ok: false, message: error.message };
    }
    throw error;
  }
  refresh();
  return { ok: true, message: "Rejected." };
}
