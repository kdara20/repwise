"use client";

import Link from "next/link";
import { useActionState } from "react";

import { fieldError, FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { ProvinceSelect, SpecialtyPicker } from "@/components/forms/trainer-fields";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/actions";
import type { Trainer } from "@/lib/db/schema";
import { updateProfile } from "./actions";

export type ProfileDraft = Pick<
  Trainer,
  | "displayName"
  | "slug"
  | "headline"
  | "bio"
  | "specialties"
  | "yearsExperience"
  | "city"
  | "province"
  | "acceptingClients"
  | "published"
>;

export function ProfileForm({ trainer: saved }: { trainer: ProfileDraft }) {
  const [state, action] = useActionState(updateProfile, initialActionState);
  const errors = (name: string) => fieldError(state, name);
  // After a failed submit, refill with what the user typed (React resets forms).
  const trainer = { ...saved, ...(state.values as Partial<ProfileDraft> | undefined) };

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors("displayName")}>
            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
            <Input
              id="displayName"
              name="displayName"
              maxLength={60}
              defaultValue={trainer.displayName}
              aria-invalid={!!errors("displayName")}
              required
            />
            <FieldError errors={errors("displayName")} />
          </Field>

          <Field data-invalid={!!errors("slug")}>
            <FieldLabel htmlFor="slug">Profile URL</FieldLabel>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span aria-hidden>/trainers/</span>
              <Input
                id="slug"
                name="slug"
                maxLength={40}
                defaultValue={trainer.slug}
                aria-invalid={!!errors("slug")}
                aria-describedby="slug-help"
                required
              />
            </div>
            <FieldDescription id="slug-help">
              Lowercase letters, numbers, and hyphens.
            </FieldDescription>
            <FieldError errors={errors("slug")} />
          </Field>
        </div>

        <Field data-invalid={!!errors("headline")}>
          <FieldLabel htmlFor="headline">Headline</FieldLabel>
          <Input
            id="headline"
            name="headline"
            maxLength={120}
            defaultValue={trainer.headline}
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
            rows={8}
            maxLength={2000}
            defaultValue={trainer.bio}
            aria-invalid={!!errors("bio")}
            required
          />
          <FieldError errors={errors("bio")} />
        </Field>

        <SpecialtyPicker defaultValue={trainer.specialties} errors={errors("specialties")} />

        <div className="grid gap-6 sm:grid-cols-3">
          <Field data-invalid={!!errors("yearsExperience")}>
            <FieldLabel htmlFor="yearsExperience">Years coaching</FieldLabel>
            <Input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              defaultValue={trainer.yearsExperience ?? ""}
              aria-invalid={!!errors("yearsExperience")}
            />
            <FieldError errors={errors("yearsExperience")} />
          </Field>
          <Field data-invalid={!!errors("city")}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" name="city" maxLength={80} defaultValue={trainer.city ?? ""} />
            <FieldError errors={errors("city")} />
          </Field>
          <Field data-invalid={!!errors("province")}>
            <FieldLabel htmlFor="province">Province / territory</FieldLabel>
            <ProvinceSelect
              // React's post-action form reset restores a <select> to its *initial*
              // default, not the latest one; remounting on the saved value fixes it.
              key={trainer.province ?? ""}
              defaultValue={trainer.province}
              invalid={!!errors("province")}
            />
            <FieldError errors={errors("province")} />
          </Field>
        </div>

        <FieldSeparator />

        <ToggleField
          name="acceptingClients"
          label="Accepting new clients"
          description="When off, your profile shows a waitlist badge."
          defaultChecked={trainer.acceptingClients}
        />
        <ToggleField
          name="published"
          label="Publish profile"
          description="Published profiles appear in the trainer directory and search engines."
          defaultChecked={trainer.published}
        />
      </FieldGroup>

      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
        {saved.published && (
          <Link
            href={`/trainers/${saved.slug}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            View public profile
          </Link>
        )}
      </div>
    </form>
  );
}

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <Field orientation="horizontal">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-primary"
      />
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  );
}
