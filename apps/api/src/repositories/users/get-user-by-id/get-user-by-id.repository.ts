import { prisma } from "@/infra/prisma/prisma-connection";

export const getUserByIdRepository = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch (error) {
    throw new Error("Failed to get user by id");
  }
};
