import { amountOfMembersNotBillableRepository } from "@/repositories/members/amount-of-members-not-billable";
import { amountOfProjectsRepository } from "@/repositories/projects/amount-of-projects";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";

type GetOrganizationBillingServiceParams = {
  userId: string;
  organizationSlug: string;
};

const UNIT_PRICING_BY_MEMBER = 10;
const UNIT_PRICING_BY_PROJECT = 20;

export async function getBillingInfoFromOrganizationService({
  userId,
  organizationSlug,
}: GetOrganizationBillingServiceParams) {
  const { organization, membership } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  const { cannot } = getUserPermissions(userId, membership?.role);

  if (cannot("get", "Billing")) {
    throw new ForbiddenError(
      "User does not have permission to view billing details"
    );
  }

  const [amountOfMembers, amountOfProjects] = await Promise.all([
    amountOfMembersNotBillableRepository({
      organizationId: organization.id,
    }),
    amountOfProjectsRepository({
      organizationId: organization.id,
    }),
  ]);

  return {
    billing: {
      seats: {
        amount: amountOfMembers,
        unit: UNIT_PRICING_BY_MEMBER,
        price: amountOfMembers * UNIT_PRICING_BY_MEMBER,
      },
      projects: {
        amount: amountOfProjects,
        unit: UNIT_PRICING_BY_PROJECT,
        price: amountOfProjects * UNIT_PRICING_BY_PROJECT,
      },
      total: {
        amount:
          amountOfMembers * UNIT_PRICING_BY_MEMBER +
          amountOfProjects * UNIT_PRICING_BY_PROJECT,
        unit: "USD",
      },
    },
  };
}
