import type { CheckboxProps } from "../checkbox";
import type { InputProps } from "../input";

type BaseFormProps = {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
};

export type FormInputProps = {
  // type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  // inputMode?: "text" | "email" | "numeric" | "tel" | "url" | "search";
} & BaseFormProps &
  InputProps;

export type FormCheckboxProps = {
  type?: "checkbox";
} & BaseFormProps &
  CheckboxProps;
