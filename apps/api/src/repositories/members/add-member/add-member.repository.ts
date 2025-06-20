import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

type AddMemberRepository = {
  userId: string;
  organizationId: string;
  role: Role;
  tx?: PrismaTransactionClient;
};

export async function addMemberRepository({
  userId,
  organizationId,
  role,
  tx,
}: AddMemberRepository) {
  try {
    const member = await (tx ?? prisma).member.create({
      data: {
        userId,
        organizationId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return member;
  } catch (error) {
    throw new Error("Failed to add member");
  }
}
