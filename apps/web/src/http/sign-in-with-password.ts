import { httpClient } from "./http-client";

interface SignInWithPasswordHttpRequest {
  email: string;
  password: string;
}

interface SignInWithPasswordHttpResponse {
  message: string;
  data: {
    token: string;
  };
}

export async function signInWithPasswordHttp({
  email,
  password,
}: SignInWithPasswordHttpRequest): Promise<SignInWithPasswordHttpResponse> {
  const response = await httpClient.post<SignInWithPasswordHttpResponse>(
    "session/email-and-password",
    {
      requireAuth: false,
      json: {
        email,
        password,
      },
    }
  );

  return response;
}
