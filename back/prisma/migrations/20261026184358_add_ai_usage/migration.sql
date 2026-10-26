-- CreateEnum
CREATE TYPE "ai_usage_kind" AS ENUM ('MATCH_DRAFT', 'IMAGE');

-- CreateEnum
CREATE TYPE "ai_provider" AS ENUM ('GEMINI', 'OPENROUTER');

-- CreateTable
CREATE TABLE "ai_usages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ai_usage_kind" NOT NULL,
    "provider" "ai_provider",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usages_userId_kind_createdAt_idx" ON "ai_usages"("userId", "kind", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_usages" ADD CONSTRAINT "ai_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
