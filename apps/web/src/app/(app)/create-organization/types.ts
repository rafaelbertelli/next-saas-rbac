export interface OrganizationState {
  message: string;
  hasError: boolean;
  errors: Record<string, string[]>;
}
