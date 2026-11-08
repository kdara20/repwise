"use client";

import { useActionState, useState } from "react";

import { fieldError, FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/actions";
import { approve, reject } from "./actions";

export function ReviewActions({ id, applicant }: { id: string; applicant: string }) {
  const [approveState, approveAction] = useActionState(approve, initialActionState);
  const [rejectState, rejectAction] = useActionState(reject, initialActionState);
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          <form action={approveAction}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton pendingLabel="Approving…" aria-label={`Approve ${applicant}`}>
              Approve
            </SubmitButton>
          </form>
          <Button variant="outline" onClick={() => setRejecting(true)}>
            Reject…
          </Button>
        </div>
      ) : (
        <form action={rejectAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={id} />
          <Field data-invalid={!!fieldError(rejectState, "reason")}>
            <FieldLabel htmlFor={`reason-${id}`}>Reason (shown to the applicant)</FieldLabel>
            <Textarea id={`reason-${id}`} name="reason" rows={3} maxLength={500} required />
            <FieldError errors={fieldError(rejectState, "reason")} />
          </Field>
          <div className="flex gap-2">
            <SubmitButton variant="destructive" pendingLabel="Rejecting…">
              Confirm rejection
            </SubmitButton>
            <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <FormMessage state={approveState} />
      <FormMessage state={rejectState.fieldErrors ? { ok: false } : rejectState} />
    </div>
  );
}
