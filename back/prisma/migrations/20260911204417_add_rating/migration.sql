-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ratings_ratedUserId_idx" ON "ratings"("ratedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_matchId_raterId_ratedUserId_key" ON "ratings"("matchId", "raterId", "ratedUserId");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
