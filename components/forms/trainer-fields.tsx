import { FieldDescription, FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { PROVINCES, SPECIALTIES, SPECIALTY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const nativeSelect =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

/** Native checkboxes so the form works before hydration and posts every value. */
export function SpecialtyPicker({
  defaultValue = [],
  errors,
}: {
  defaultValue?: string[];
  errors?: { message?: string }[];
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Specialties</FieldLegend>
      <FieldDescription>Pick 1–5.</FieldDescription>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SPECIALTIES.map((s) => (
          <label
            key={s}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm has-checked:border-primary/40 has-checked:bg-primary/5"
          >
            <input
              type="checkbox"
              name="specialties"
              value={s}
              defaultChecked={defaultValue.includes(s)}
              className="size-4 accent-primary"
            />
            {SPECIALTY_LABELS[s]}
          </label>
        ))}
      </div>
      <FieldError errors={errors} />
    </FieldSet>
  );
}

export function ProvinceSelect({
  id = "province",
  name = "province",
  defaultValue,
  placeholder = "Select a province",
  className,
  invalid,
}: {
  id?: string;
  name?: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      aria-invalid={invalid || undefined}
      className={cn(nativeSelect, className)}
    >
      <option value="">{placeholder}</option>
      {Object.entries(PROVINCES).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function SpecialtySelect({
  defaultValue,
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  return (
    <select
      id="specialty"
      name="specialty"
      defaultValue={defaultValue ?? ""}
      className={cn(nativeSelect, className)}
    >
      <option value="">All specialties</option>
      {SPECIALTIES.map((s) => (
        <option key={s} value={s}>
          {SPECIALTY_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
