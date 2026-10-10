-- AlterTable
ALTER TABLE "users" ADD COLUMN     "level" "level";

-- CreateTable
CREATE TABLE "user_sports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_sports_sportId_idx" ON "user_sports"("sportId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sports_userId_sportId_key" ON "user_sports"("userId", "sportId");

-- AddForeignKey
ALTER TABLE "user_sports" ADD CONSTRAINT "user_sports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sports" ADD CONSTRAINT "user_sports_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
