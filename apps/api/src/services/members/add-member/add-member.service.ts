import { Role } from "@/generated/prisma";
import { addMemberRepository } from "@/repositories/members/add-member";

type AddMemberService = {
  userId: string;
  organizationId: string;
  role: Role;
  tx?: PrismaTransactionClient;
};

export async function addMemberService({
  userId,
  organizationId,
  role,
  tx,
}: AddMemberService) {
  const member = await addMemberRepository({
    userId,
    organizationId,
    role,
    tx,
  });

  return member;
}
