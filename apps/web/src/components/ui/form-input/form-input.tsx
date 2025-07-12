import { Input } from "../input";
import { Label } from "../label";
import { FormInputProps } from "./form-input.types";

export function FormInput({
  label,
  name,
  type = "text",
  error = "",
  disabled = false,
  required = false,
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        name={name}
        id={name}
        type={type}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
