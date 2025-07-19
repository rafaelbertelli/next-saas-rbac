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

export async function signInWithGithubHttp({
  code,
}: SignInWithGithubHttpRequest): Promise<SignInWithGithubHttpResponse> {
  const response = await httpClient
    .post("session/authenticate-with-github", {
      json: {
        code,
      },
    })
    .json<SignInWithGithubHttpResponse>();

  return response;
}
