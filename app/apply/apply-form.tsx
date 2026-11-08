"use client";

import { useActionState } from "react";

import { fieldError, FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { SpecialtyPicker } from "@/components/forms/trainer-fields";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/actions";
import type { TrainerApplication } from "@/lib/db/schema";
import { submitApplication } from "./actions";

export type ApplicationDraft = Pick<
  TrainerApplication,
  "headline" | "bio" | "specialties" | "certifications"
>;

export function ApplyForm({ previous }: { previous?: ApplicationDraft | null }) {
  const [state, action] = useActionState(submitApplication, initialActionState);
  const errors = (name: string) => fieldError(state, name);
  // After a failed submit, refill with what the user typed.
  previous = (state.values as ApplicationDraft | undefined) ?? previous;

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors("headline")}>
          <FieldLabel htmlFor="headline">Headline</FieldLabel>
          <Input
            id="headline"
            name="headline"
            maxLength={120}
            defaultValue={previous?.headline}
            placeholder="Strength coach for busy parents"
            aria-invalid={!!errors("headline")}
            required
          />
          <FieldError errors={errors("headline")} />
        </Field>

        <Field data-invalid={!!errors("bio")}>
          <FieldLabel htmlFor="bio">About you</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            rows={6}
            maxLength={2000}
            defaultValue={previous?.bio}
            aria-invalid={!!errors("bio")}
            required
          />
          <FieldDescription>50–2,000 characters. Clients see this on your profile.</FieldDescription>
          <FieldError errors={errors("bio")} />
        </Field>

        <SpecialtyPicker defaultValue={previous?.specialties} errors={errors("specialties")} />

        <Field data-invalid={!!errors("certifications")}>
          <FieldLabel htmlFor="certifications">Certifications</FieldLabel>
          <Textarea
            id="certifications"
            name="certifications"
            rows={3}
            maxLength={1000}
            defaultValue={previous?.certifications}
            placeholder="e.g. CSEP-CPT (2021), NASM-CPT, First Aid + CPR"
            aria-invalid={!!errors("certifications")}
            required
          />
          <FieldDescription>We may ask for proof before approving.</FieldDescription>
          <FieldError errors={errors("certifications")} />
        </Field>
      </FieldGroup>

      <FormMessage state={state} />
      <SubmitButton className="self-start" pendingLabel="Submitting…">
        Submit application
      </SubmitButton>
    </form>
  );
}
