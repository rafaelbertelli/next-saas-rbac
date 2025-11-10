"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormCheckbox, FormInput } from "@/components/ui/form-fields";
import { useFormState } from "@/hooks/use-form-state";
import { AlertTriangle, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createOrgenization } from "./actions";
import { INITIAL_STATE } from "./constants";
import { OrganizationState } from "./types";

export function OrganizationForm() {
  const { state, handleSubmit, isPending } = useFormState<OrganizationState>(
    createOrgenization,
    INITIAL_STATE,
    (state) => {
      if (!state.hasError) {
        redirect("/auth/sign-in");
      }
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Erro ao criar conta</AlertTitle>
          <AlertDescription>
            <span className="text-xs">{state.message}</span>
          </AlertDescription>
        </Alert>
      )}

      <FormInput
        label="Organization Name"
        name="name"
        type="text"
        inputMode="url"
        placeholder="example.com"
        error={state.errors.name?.[0]}
        disabled={isPending}
        required
      />

      <FormInput
        label="E-mail domain"
        name="domain"
        type="text"
        error={state.errors.domain?.[0]}
        disabled={isPending}
        required
      />

      <FormCheckbox
        label="Auto-join new members"
        name="shouldAttachUsersByDomain"
        error={state.errors.shouldAttachUsersByDomain?.[0]}
        disabled={isPending}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : ""}
        Save organization
      </Button>
    </form>
  );
}
