import { httpClient } from "./http-client";

interface GetUserProfileHttpResponse {
  data: {
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
    };
  };
}

export async function getUserProfileHttp(): Promise<GetUserProfileHttpResponse> {
  return httpClient.get<GetUserProfileHttpResponse>("users");
}
