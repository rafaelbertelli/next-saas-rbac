import { httpClient } from "./http-client";

export interface GetProjectsHttpResponse {
  data: {
    projects: Array<{
      description: string | null;
      id: string;
      name: string;
      slug: string;
      avatarUrl: string | null;
      ownerId: string;
      organizationId: string;
      createdAt: string;
      updatedAt: string;
      owner: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
        email: string | null;
      };
    }>;
  };
}

export async function getProjectsHttp(
  organizationSlug: string
): Promise<GetProjectsHttpResponse> {
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return httpClient.get<GetProjectsHttpResponse>(
    `organizations/${organizationSlug}/projects`
  );
}
