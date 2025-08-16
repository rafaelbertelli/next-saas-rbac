export interface SignUpState {
  message: string;
  hasError: boolean;
  errors: Record<string, string[]>;
}
