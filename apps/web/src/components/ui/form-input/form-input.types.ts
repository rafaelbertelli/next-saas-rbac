export type FormInputProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  error?: string;
  disabled?: boolean;
  required?: boolean;
};
