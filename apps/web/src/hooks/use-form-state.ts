import { useState, useTransition } from "react";

export function useFormState<T>(
  action: (formData: FormData) => Promise<T>,
  initialState: T,
  onSuccess?: (state: T) => void
) {
  const [state, setState] = useState<T>(initialState);

  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await action(formData);
      setState(response);

      if (onSuccess) {
        onSuccess(response);
      }
    });
  }

  return { state, handleSubmit, isPending };
}
