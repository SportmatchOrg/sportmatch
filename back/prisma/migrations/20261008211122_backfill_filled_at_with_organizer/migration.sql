UPDATE "matches" AS m
SET "filledAt" = filler."createdAt"
FROM (
  SELECT
    p."matchId",
    p."createdAt",
    ROW_NUMBER() OVER (PARTITION BY p."matchId" ORDER BY p."createdAt", p."id") AS "position"
  FROM "participants" AS p
) AS filler
WHERE filler."matchId" = m."id"
  AND filler."position" = m."capacity" - 1
  AND m."status" = 'ACTIVE'
  AND m."filledAt" IS NULL;
