import { PageMain } from "@/components/page-main";
import { PageWrapper } from "@/components/page-wrapper";
import { getUserProfile } from "../../_backend/users/get-user-profile";

export default async function Home() {
  const { user } = await getUserProfile();

  return (
    <PageWrapper>
      <PageMain title="Select an organization" isEmpty />
    </PageWrapper>
  );
}
