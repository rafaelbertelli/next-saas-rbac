import { httpClient } from "./http-client";

interface SignInWithGithubHttpRequest {
  code: string;
}

interface SignInWithGithubHttpResponse {
  message: string;
  data: {
    token: string;
  };
}

export function signInWithGithubHttp({
  code,
}: SignInWithGithubHttpRequest): Promise<SignInWithGithubHttpResponse> {
  console.log("code.......", code);

  const response = httpClient.post<SignInWithGithubHttpResponse>(
    "session/authenticate-with-github",
    {
      requireAuth: false,
      json: {
        code,
      },
    }
  );

  return response;
}
