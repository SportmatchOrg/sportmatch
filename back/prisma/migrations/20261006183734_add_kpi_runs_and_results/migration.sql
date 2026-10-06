-- CreateEnum
CREATE TYPE "kpi_result_status" AS ENUM ('READY', 'NO_DATA', 'ERROR');

-- CreateTable
CREATE TABLE "kpi_runs" (
    "id" TEXT NOT NULL,
    "measurementDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_results" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "value" DECIMAL(20,6),
    "status" "kpi_result_status" NOT NULL,
    "numerator" DECIMAL(20,6),
    "denominator" DECIMAL(20,6),
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kpi_runs_measurementDate_idx" ON "kpi_runs"("measurementDate");

-- CreateIndex
CREATE INDEX "kpi_results_kpiId_createdAt_idx" ON "kpi_results"("kpiId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_results_runId_kpiId_key" ON "kpi_results"("runId", "kpiId");

-- AddForeignKey
ALTER TABLE "kpi_results" ADD CONSTRAINT "kpi_results_runId_fkey" FOREIGN KEY ("runId") REFERENCES "kpi_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
