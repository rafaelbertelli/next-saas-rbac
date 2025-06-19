import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

type CreateInviteRepository = {
  email: string;
  role: Role;
  organizationId: string;
  inviterId: string;
};

export async function createInviteRepository({
  email,
  role,
  organizationId,
  inviterId,
}: CreateInviteRepository) {
  try {
    const invite = await prisma.invite.create({
      data: {
        email,
        role,
        organizationId,
        inviterId,
        status: "PENDING",
      },
    });

    return invite;
  } catch (error) {
    throw new Error("Failed to create invite");
  }
}
