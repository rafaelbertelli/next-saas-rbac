import { httpClient } from "./http-client";

interface SignInWithPasswordRequest {
  email: string;
  password: string;
}

interface SignInWithPasswordResponse {
  message: string;
  data: {
    token: string;
  };
}

export async function signInWithPassword({
  email,
  password,
}: SignInWithPasswordRequest): Promise<SignInWithPasswordResponse> {
  const response = await httpClient
    .post("session/email-and-password", {
      json: {
        email,
        password,
      },
    })
    .json<SignInWithPasswordResponse>();

  return response;
}
