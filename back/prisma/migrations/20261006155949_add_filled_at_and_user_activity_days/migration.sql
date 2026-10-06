-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "filledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_activity_days" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_days_activityDate_idx" ON "user_activity_days"("activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "user_activity_days_userId_activityDate_key" ON "user_activity_days"("userId", "activityDate");

-- AddForeignKey
ALTER TABLE "user_activity_days" ADD CONSTRAINT "user_activity_days_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
