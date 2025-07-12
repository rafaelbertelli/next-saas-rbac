export interface SignInWithEmailAndPasswordState {
  message: string;
  hasError: boolean;
  errors: Record<string, string[]>;
}
