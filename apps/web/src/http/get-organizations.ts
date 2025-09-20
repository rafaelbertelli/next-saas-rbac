import { httpClient } from "./http-client";

export interface GetOrganizationsHttpResponse {
  data: {
    organizations: Array<{
      id: string;
      name: string;
      slug: string;
      avatarUrl: string | null;
    }>;
  };
}

export async function getOrganizationsHttp(): Promise<GetOrganizationsHttpResponse> {
  return httpClient.get<GetOrganizationsHttpResponse>("organizations");
}
