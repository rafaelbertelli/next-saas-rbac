import { Role } from "@repo/auth";
import { httpClient } from "./http-client";

export interface GetUserMembershipResponse {
  message: string;
  data: {
    membership: {
      id: string;
      role: Role;
      status: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    user: {
      id: string;
    };
  };
}

export async function getMembershipHttp(slug: string) {
  return httpClient.get<GetUserMembershipResponse>(
    `organizations/${slug}/membership`
  );
}
