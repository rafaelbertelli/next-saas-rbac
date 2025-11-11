import { PageMain } from "@/components/page-main";
import { PageWrapper } from "@/components/page-wrapper";
import { OrganizationForm } from "./organization-form";

export default function CreateOrganizationPage() {
  return (
    <PageWrapper>
      <PageMain title="Create Organization">
        <OrganizationForm />
      </PageMain>
    </PageWrapper>
  );
}
