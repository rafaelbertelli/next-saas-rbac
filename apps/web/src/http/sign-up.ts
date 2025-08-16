import { httpClient } from "./http-client";

interface SignUpHttpRequest {
  name: string;
  email: string;
  password: string;
}

type SignUpHttpResponse = void;

export async function signUpHttp({
  name,
  email,
  password,
}: SignUpHttpRequest): Promise<void> {
  await httpClient.post<SignUpHttpResponse>("users", {
    requireAuth: false,
    json: {
      name,
      email,
      password,
    },
  });
}
