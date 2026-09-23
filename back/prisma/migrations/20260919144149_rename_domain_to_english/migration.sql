-- Tables
ALTER TABLE "deportes" RENAME TO "sports";
ALTER TABLE "partidos" RENAME TO "matches";
ALTER TABLE "participantes" RENAME TO "participants";

-- Columns: users
ALTER TABLE "users" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "users" RENAME COLUMN "fotoUrl" TO "photoUrl";

-- Columns: sports
ALTER TABLE "sports" RENAME COLUMN "nombre" TO "name";

-- Columns: matches
ALTER TABLE "matches" RENAME COLUMN "deporteId" TO "sportId";
ALTER TABLE "matches" RENAME COLUMN "nivel" TO "level";
ALTER TABLE "matches" RENAME COLUMN "fecha" TO "date";
ALTER TABLE "matches" RENAME COLUMN "ubicacion" TO "location";
ALTER TABLE "matches" RENAME COLUMN "cupo" TO "capacity";
ALTER TABLE "matches" RENAME COLUMN "descripcion" TO "description";
ALTER TABLE "matches" RENAME COLUMN "organizadorId" TO "organizerId";

-- Columns: participants
ALTER TABLE "participants" RENAME COLUMN "partidoId" TO "matchId";
ALTER TABLE "participants" RENAME COLUMN "usuarioId" TO "userId";

-- Enum
ALTER TYPE "nivel" RENAME TO "level";
ALTER TYPE "level" RENAME VALUE 'PRINCIPIANTE' TO 'BEGINNER';
ALTER TYPE "level" RENAME VALUE 'INTERMEDIO' TO 'INTERMEDIATE';
ALTER TYPE "level" RENAME VALUE 'AVANZADO' TO 'ADVANCED';

-- Primary keys
ALTER TABLE "sports" RENAME CONSTRAINT "deportes_pkey" TO "sports_pkey";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_pkey" TO "matches_pkey";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_pkey" TO "participants_pkey";

-- Foreign keys
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_deporteId_fkey" TO "matches_sportId_fkey";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_organizadorId_fkey" TO "matches_organizerId_fkey";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_partidoId_fkey" TO "participants_matchId_fkey";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_usuarioId_fkey" TO "participants_userId_fkey";

-- Unique and secondary indexes
ALTER INDEX "deportes_nombre_key" RENAME TO "sports_name_key";
ALTER INDEX "participantes_partidoId_usuarioId_key" RENAME TO "participants_matchId_userId_key";
ALTER INDEX "participantes_usuarioId_idx" RENAME TO "participants_userId_idx";
ALTER INDEX "partidos_deporteId_idx" RENAME TO "matches_sportId_idx";
ALTER INDEX "partidos_fecha_idx" RENAME TO "matches_date_idx";

-- Not null constraint names
ALTER TABLE "users" RENAME CONSTRAINT "users_nombre_not_null" TO "users_name_not_null";

ALTER TABLE "sports" RENAME CONSTRAINT "deportes_id_not_null" TO "sports_id_not_null";
ALTER TABLE "sports" RENAME CONSTRAINT "deportes_nombre_not_null" TO "sports_name_not_null";
ALTER TABLE "sports" RENAME CONSTRAINT "deportes_createdAt_not_null" TO "sports_createdAt_not_null";
ALTER TABLE "sports" RENAME CONSTRAINT "deportes_updatedAt_not_null" TO "sports_updatedAt_not_null";

ALTER TABLE "matches" RENAME CONSTRAINT "partidos_id_not_null" TO "matches_id_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_deporteId_not_null" TO "matches_sportId_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_nivel_not_null" TO "matches_level_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_fecha_not_null" TO "matches_date_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_ubicacion_not_null" TO "matches_location_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_cupo_not_null" TO "matches_capacity_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_organizadorId_not_null" TO "matches_organizerId_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_createdAt_not_null" TO "matches_createdAt_not_null";
ALTER TABLE "matches" RENAME CONSTRAINT "partidos_updatedAt_not_null" TO "matches_updatedAt_not_null";

ALTER TABLE "participants" RENAME CONSTRAINT "participantes_id_not_null" TO "participants_id_not_null";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_partidoId_not_null" TO "participants_matchId_not_null";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_usuarioId_not_null" TO "participants_userId_not_null";
ALTER TABLE "participants" RENAME CONSTRAINT "participantes_createdAt_not_null" TO "participants_createdAt_not_null";
