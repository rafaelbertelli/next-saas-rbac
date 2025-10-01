import { cookies } from "next/headers";

export async function getOrganizationSlug() {
  const cookieStore = await cookies();

  return cookieStore.get("org")?.value ?? null;
}
