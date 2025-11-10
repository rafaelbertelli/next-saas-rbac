import { httpClient } from "./http-client";

interface CreateOrganizationHttpRequest {
  name: string;
  domain: string | null | undefined;
  shouldAttachUsersByDomain: boolean;
}

type CreateOrganizationHttpResponse = void;

export async function createOrganizationHttp({
  name,
  domain,
  shouldAttachUsersByDomain,
}: CreateOrganizationHttpRequest): Promise<void> {
  await httpClient.post<CreateOrganizationHttpResponse>("organizations", {
    requireAuth: true,
    json: {
      name,
      domain,
      shouldAttachUsersByDomain,
    },
  });
}
