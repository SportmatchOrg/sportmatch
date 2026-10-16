-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboardedAt" TIMESTAMP(3);

-- Existing users have already completed onboarding.
UPDATE "users" SET "onboardedAt" = "createdAt";
