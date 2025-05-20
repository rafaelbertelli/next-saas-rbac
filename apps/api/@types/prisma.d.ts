import { Prisma, PrismaClient } from "@/generated/prisma";
import { DefaultArgs } from "@prisma/client/runtime/library";
import "prisma";

declare global {
  type PrismaTransactionClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}
