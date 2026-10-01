-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'PARTICIPANT_LEFT';
ALTER TYPE "notification_type" ADD VALUE 'MATCH_UPDATED';
ALTER TYPE "notification_type" ADD VALUE 'NO_SHOW_CONFIRMED';
ALTER TYPE "notification_type" ADD VALUE 'USER_SUSPENDED';
