-- CreateEnum
CREATE TYPE "deporte" AS ENUM ('FUTBOL', 'BASQUET', 'TENIS', 'PADEL', 'RUNNING');

-- CreateEnum
CREATE TYPE "nivel" AS ENUM ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO');

-- CreateTable
CREATE TABLE "partidos" (
    "id" TEXT NOT NULL,
    "deporte" "deporte" NOT NULL,
    "nivel" "nivel" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cupo" INTEGER NOT NULL,
    "descripcion" TEXT,
    "organizadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partidos_fecha_idx" ON "partidos"("fecha");

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
