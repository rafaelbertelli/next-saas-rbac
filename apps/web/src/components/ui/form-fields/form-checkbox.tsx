import { Checkbox } from "../checkbox";
import { FormCheckboxProps } from "./form-fields.types";

export function FormCheckbox({
  label,
  name,
  error = "",
  disabled = false,
  required = false,
}: FormCheckboxProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline space-x-2">
        <Checkbox
          id={name}
          className="translate-y-0.5"
          name={name}
          disabled={disabled}
          required={required}
        />
        <label htmlFor={name} className="space-y-1">
          <span className="text-sm leading-none font-medium">{label}</span>
          <p className="text-muted-foreground text-sm">
            This will automatically invite all members with same e-mail domain
            to this organization
          </p>
        </label>
      </div>
      <div className="min-h-[1.25rem]">
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
}
