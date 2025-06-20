import { getUserByIdRepository } from "@/repositories/users/get-user-by-id";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

export const getUserByIdService = async (userId: string) => {
  const user = await getUserByIdRepository(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};
