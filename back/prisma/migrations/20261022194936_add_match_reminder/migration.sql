-- AlterEnum
ALTER TYPE "notification_type" ADD VALUE 'MATCH_REMINDER';

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
