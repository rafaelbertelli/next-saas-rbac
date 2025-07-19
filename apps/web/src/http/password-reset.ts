import { httpClient } from "./http-client";

interface PasswordResetHttpRequest {
  token: string;
  password: string;
}

export async function passwordResetHttp({
  token,
  password,
}: PasswordResetHttpRequest): Promise<void> {
  return httpClient.post<void>("session/password-reset", {
    requireAuth: false,
    json: {
      token,
      password,
    },
  });
}
