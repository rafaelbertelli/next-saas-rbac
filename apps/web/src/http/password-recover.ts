import { httpClient } from "./http-client";

interface PasswordRecoverHttpRequest {
  email: string;
}

export async function passwordRecoverHttp({
  email,
}: PasswordRecoverHttpRequest): Promise<void> {
  return httpClient.post<void>("session/password-recover", {
    requireAuth: false,
    json: {
      email,
    },
  });
}
