-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
