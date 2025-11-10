import { Input } from "../input";
import { Label } from "../label";
import { FormInputProps } from "./form-fields.types";

export function FormInput({
  label,
  name,
  type = "text",
  error = "",
  disabled = false,
  required = false,
  inputMode = "text",
  placeholder = "",
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        disabled={disabled}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
