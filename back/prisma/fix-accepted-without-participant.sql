DELETE FROM join_requests jr
WHERE jr.status = 'ACCEPTED'
  AND NOT EXISTS (
  SELECT 1 FROM participants p
  WHERE p."matchId" = jr."matchId" AND p."userId" = jr."userId"
);
