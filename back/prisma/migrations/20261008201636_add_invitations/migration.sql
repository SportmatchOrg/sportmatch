-- CreateEnum
CREATE TYPE "join_request_origin" AS ENUM ('REQUEST', 'INVITATION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'INVITATION_RECEIVED';
ALTER TYPE "notification_type" ADD VALUE 'INVITATION_ACCEPTED';
ALTER TYPE "notification_type" ADD VALUE 'INVITATION_REJECTED';

-- AlterTable
ALTER TABLE "join_requests" ADD COLUMN     "origin" "join_request_origin" NOT NULL DEFAULT 'REQUEST';
