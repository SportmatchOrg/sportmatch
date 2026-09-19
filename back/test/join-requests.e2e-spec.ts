import request from 'supertest';
import type { Server } from 'http';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  setAuthUser,
  resetAuthUser,
  type TestContext,
} from './setup-e2e';
import {
  seedBaseline,
  futureDate,
  matchPayload,
  TEST_USER,
  OTHER_USER,
  type Baseline,
} from './fixtures';

describe('Join Requests (Organizer Endpoints)', () => {
  let ctx: TestContext;
  let server: Server;
  let matchId: string;
  let baseline: Baseline;

  beforeAll(async () => {
    ctx = await createTestApp();
    server = ctx.app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.prisma);
    baseline = await seedBaseline(ctx.prisma);
    setAuthUser(TEST_USER);
    const matchResponse = await request(server)
      .post('/matches')
      .send(matchPayload(baseline.sportId, { capacity: 2 }))
      .expect(201);
    matchId = (matchResponse.body as { id: string }).id;
    // Create a join request for the other user
    await ctx.prisma.joinRequest.create({
      data: {
        matchId: matchId,
        userId: baseline.otherId,
        status: 'PENDING',
      },
    });
    resetAuthUser();
  });

  describe('GET /matches/:matchId/join-requests', () => {
    it('[AC-1] returns 200 for organizer with list containing name and photoUrl', async () => {
      setAuthUser(TEST_USER);
      const body = (
        await request(server)
          .get(`/matches/${matchId}/join-requests`)
          .expect(200)
      ).body as Array<{
        id: string;
        user: { name: string; photoUrl: string | null };
      }>;
      expect(body.length).toBe(1);
      expect(body[0].user.name).toBe(OTHER_USER.name);
      expect(body[0].user.photoUrl).toBeNull(); // because photoUrl is not set in seed
      // Ensure email and firebaseUid are not present
      expect(body[0].user).not.toHaveProperty('email');
      expect(body[0].user).not.toHaveProperty('firebaseUid');
      resetAuthUser();
    });

    it('[AC-1] returns 403 for non-organizer', async () => {
      setAuthUser(OTHER_USER);
      await request(server)
        .get(`/matches/${matchId}/join-requests`)
        .expect(403);
      resetAuthUser();
    });
    // Note: 401 test skipped due to harness limitation (guard override always sets a user)
  });

  describe('PATCH /matches/:matchId/join-requests/:id', () => {
    it('[AC-3] accepts a join request (status: ACCEPTED) -> 200, creates participant, updates joinedCount', async () => {
      // Get the join request id
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);
      // Check join request status updated
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('ACCEPTED');
      // Check participant created
      const participant = await ctx.prisma.participant.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(participant).not.toBeNull();
      // Check joinedCount increased by 1
      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { participants: true } } },
      });
      expect(match?._count.participants).toBe(1);
      resetAuthUser();
    });

    it('[AC-4] rejects a join request (status: REJECTED) -> 200, no participant created, joinedCount unchanged', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'REJECTED' })
        .expect(200);
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('REJECTED');
      const participant = await ctx.prisma.participant.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(participant).toBeNull();
      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { participants: true } } },
      });
      expect(match?._count.participants).toBe(0);
      resetAuthUser();
    });

    it('[AC-5] accepting when capacity is full -> 409, join request remains PENDING, no participant', async () => {
      // Fill the capacity (2) by creating two participants
      const user1 = await ctx.prisma.user.create({
        data: {
          firebaseUid: 'e2e-uid-user1',
          email: 'user1@e2e.test',
          name: 'User1 E2E',
        },
      });
      const user2 = await ctx.prisma.user.create({
        data: {
          firebaseUid: 'e2e-uid-user2',
          email: 'user2@e2e.test',
          name: 'User2 E2E',
        },
      });
      // Have them join the match
      await ctx.prisma.participant.createMany({
        data: [
          { matchId: matchId, userId: user1.id },
          { matchId: matchId, userId: user2.id },
        ],
      });
      // Now capacity is full (2 participants)
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);
      // Join request should still be PENDING
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('PENDING');
      // No new participant
      const participantCount = await ctx.prisma.participant.count({
        where: { matchId: matchId },
      });
      expect(participantCount).toBe(2); // still the two we added
      resetAuthUser();
    });

    it('[AC-6] resolving twice the same request -> 409', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      // First accept
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);
      // Second accept on same request
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);
      resetAuthUser();
    });

    it('[AC-6] body with PENDING status -> 400', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'PENDING' })
        .expect(400);
      resetAuthUser();
    });

    it('[AC-6] body with invalid status -> 400', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
      resetAuthUser();
    });

    it('[AC-6] id inexistent -> 404', async () => {
      setAuthUser(TEST_USER);
      await request(server)
        .patch(
          `/matches/${matchId}/join-requests/00000000-0000-0000-0000-000000000000`,
        )
        .send({ status: 'ACCEPTED' })
        .expect(404);
      resetAuthUser();
    });

    it('[AC-6] id of another match -> 404', async () => {
      // Create another match
      setAuthUser(TEST_USER);
      const otherMatchResponse = await request(server)
        .post('/matches')
        .send(matchPayload(baseline.sportId, { capacity: 10 }))
        .expect(201);
      const otherMatchId = (otherMatchResponse.body as { id: string }).id;
      resetAuthUser();
      // Use the join request from the first match
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otherId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${otherMatchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(404);
      resetAuthUser();
    });

    it('[AC-6] match already played (date in the past) -> 400', async () => {
      // Create a match in the past directly in the database
      setAuthUser(TEST_USER);
      const pastDate = futureDate(-7); // 7 days ago
      const match = await ctx.prisma.match.create({
        data: {
          sportId: baseline.sportId,
          level: 'INTERMEDIATE',
          date: pastDate,
          location: 'Cancha E2E',
          capacity: 10,
          organizerId: baseline.organizerId,
        },
      });
      // Create a join request for the other user
      const joinRequest = await ctx.prisma.joinRequest.create({
        data: {
          matchId: match.id,
          userId: baseline.otherId,
          status: 'PENDING',
        },
      });
      resetAuthUser();

      // Now try to accept the join request as organizer
      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/matches/${match.id}/join-requests/${joinRequest.id}`)
        .send({ status: 'ACCEPTED' })
        .expect(400);
      resetAuthUser();
    });
  });

  describe('GET /matches/:id (pendingRequests field)', () => {
    it('[AC-7] pendingRequests returns the real number for organizer', async () => {
      // We already have one pending join request
      setAuthUser(TEST_USER);
      const body = (
        await request(server).get(`/matches/${matchId}`).expect(200)
      ).body as {
        pendingRequests: number | null;
        // ... other fields
      };
      expect(body.pendingRequests).toBe(1);
      resetAuthUser();
    });

    it('[AC-7] pendingRequests returns null for non-organizer', async () => {
      setAuthUser(OTHER_USER);
      const body = (
        await request(server).get(`/matches/${matchId}`).expect(200)
      ).body as {
        pendingRequests: number | null;
      };
      expect(body.pendingRequests).toBeNull();
      resetAuthUser();
    });
    // Note: 401 test skipped due to harness limitation
  });
});
