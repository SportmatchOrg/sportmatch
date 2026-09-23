-- CreateEnum
CREATE TYPE "match_status" AS ENUM ('ACTIVE', 'CANCELED');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "status" "match_status" NOT NULL DEFAULT 'ACTIVE';
