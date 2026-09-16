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
  partidoPayload,
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
    const partidoResponse = await request(server)
      .post('/partidos')
      .send(partidoPayload(baseline.deporteId, { cupo: 2 }))
      .expect(201);
    matchId = (partidoResponse.body as { id: string }).id;
    // Create a join request for the other user
    await ctx.prisma.joinRequest.create({
      data: {
        matchId: matchId,
        userId: baseline.otroId,
        status: 'PENDING',
      },
    });
    resetAuthUser();
  });

  describe('GET /partidos/:matchId/join-requests', () => {
    it('[AC-1] returns 200 for organizer with list containing nombre and fotoUrl', async () => {
      setAuthUser(TEST_USER);
      const body = (
        await request(server)
          .get(`/partidos/${matchId}/join-requests`)
          .expect(200)
      ).body as Array<{
        id: string;
        user: { nombre: string; fotoUrl: string | null };
      }>;
      expect(body.length).toBe(1);
      expect(body[0].user.nombre).toBe(OTHER_USER.nombre);
      expect(body[0].user.fotoUrl).toBeNull(); // because fotoUrl is not set in seed
      // Ensure email and firebaseUid are not present
      expect(body[0].user).not.toHaveProperty('email');
      expect(body[0].user).not.toHaveProperty('firebaseUid');
      resetAuthUser();
    });

    it('[AC-1] returns 403 for non-organizer', async () => {
      setAuthUser(OTHER_USER);
      await request(server)
        .get(`/partidos/${matchId}/join-requests`)
        .expect(403);
      resetAuthUser();
    });
    // Note: 401 test skipped due to harness limitation (guard override always sets a user)
  });

  describe('PATCH /partidos/:matchId/join-requests/:id', () => {
    it('[AC-3] accepts a join request (status: ACCEPTED) -> 200, creates participant, updates anotados', async () => {
      // Get the join request id
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);
      // Check join request status updated
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('ACCEPTED');
      // Check participant created
      const participant = await ctx.prisma.participante.findFirst({
        where: { partidoId: matchId, usuarioId: baseline.otroId },
      });
      expect(participant).not.toBeNull();
      // Check anotados increased by 1
      const partido = await ctx.prisma.partido.findUnique({
        where: { id: matchId },
        include: { _count: { select: { participantes: true } } },
      });
      expect(partido?._count.participantes).toBe(1);
      resetAuthUser();
    });

    it('[AC-4] rejects a join request (status: REJECTED) -> 200, no participant created, anotados unchanged', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'REJECTED' })
        .expect(200);
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('REJECTED');
      const participant = await ctx.prisma.participante.findFirst({
        where: { partidoId: matchId, usuarioId: baseline.otroId },
      });
      expect(participant).toBeNull();
      const partido = await ctx.prisma.partido.findUnique({
        where: { id: matchId },
        include: { _count: { select: { participantes: true } } },
      });
      expect(partido?._count.participantes).toBe(0);
      resetAuthUser();
    });

    it('[AC-5] accepting when cupo is full -> 409, join request remains PENDING, no participant', async () => {
      // Fill the cupo (2) by creating two participants
      const user1 = await ctx.prisma.user.create({
        data: {
          firebaseUid: 'e2e-uid-user1',
          email: 'user1@e2e.test',
          nombre: 'User1 E2E',
        },
      });
      const user2 = await ctx.prisma.user.create({
        data: {
          firebaseUid: 'e2e-uid-user2',
          email: 'user2@e2e.test',
          nombre: 'User2 E2E',
        },
      });
      // Have them join the partido
      await ctx.prisma.participante.createMany({
        data: [
          { partidoId: matchId, usuarioId: user1.id },
          { partidoId: matchId, usuarioId: user2.id },
        ],
      });
      // Now cupo is full (2 participants)
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);
      // Join request should still be PENDING
      const updatedJR = await ctx.prisma.joinRequest.findUnique({
        where: { id: joinRequestId },
      });
      expect(updatedJR?.status).toBe('PENDING');
      // No new participant
      const participantCount = await ctx.prisma.participante.count({
        where: { partidoId: matchId },
      });
      expect(participantCount).toBe(2); // still the two we added
      resetAuthUser();
    });

    it('[AC-6] resolving twice the same request -> 409', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      // First accept
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);
      // Second accept on same request
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);
      resetAuthUser();
    });

    it('[AC-6] body with PENDING status -> 400', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'PENDING' })
        .expect(400);
      resetAuthUser();
    });

    it('[AC-6] body with invalid status -> 400', async () => {
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
      resetAuthUser();
    });

    it('[AC-6] id inexistent -> 404', async () => {
      setAuthUser(TEST_USER);
      await request(server)
        .patch(
          `/partidos/${matchId}/join-requests/00000000-0000-0000-0000-000000000000`,
        )
        .send({ status: 'ACCEPTED' })
        .expect(404);
      resetAuthUser();
    });

    it('[AC-6] id of another match -> 404', async () => {
      // Create another match
      setAuthUser(TEST_USER);
      const otroPartidoResponse = await request(server)
        .post('/partidos')
        .send(partidoPayload(baseline.deporteId, { cupo: 10 }))
        .expect(201);
      const otroMatchId = (otroPartidoResponse.body as { id: string }).id;
      resetAuthUser();
      // Use the join request from the first match
      const joinRequest = await ctx.prisma.joinRequest.findFirst({
        where: { matchId: matchId, userId: baseline.otroId },
      });
      expect(joinRequest).not.toBeNull();
      const joinRequestId = joinRequest!.id;

      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${otroMatchId}/join-requests/${joinRequestId}`)
        .send({ status: 'ACCEPTED' })
        .expect(404);
      resetAuthUser();
    });

    it('[AC-6] match already played (fecha in the past) -> 400', async () => {
      // Create a match in the past directly in the database
      setAuthUser(TEST_USER);
      const pastDate = futureDate(-7); // 7 days ago
      const match = await ctx.prisma.partido.create({
        data: {
          deporteId: baseline.deporteId,
          nivel: 'INTERMEDIO',
          fecha: pastDate,
          ubicacion: 'Cancha E2E',
          cupo: 10,
          organizadorId: baseline.organizadorId,
        },
      });
      // Create a join request for the other user
      const joinRequest = await ctx.prisma.joinRequest.create({
        data: {
          matchId: match.id,
          userId: baseline.otroId,
          status: 'PENDING',
        },
      });
      resetAuthUser();

      // Now try to accept the join request as organizer
      setAuthUser(TEST_USER);
      await request(server)
        .patch(`/partidos/${match.id}/join-requests/${joinRequest.id}`)
        .send({ status: 'ACCEPTED' })
        .expect(400);
      resetAuthUser();
    });
  });

  describe('GET /partidos/:id (pending_requests field)', () => {
    it('[AC-7] pending_requests returns the real number for organizer', async () => {
      // We already have one pending join request
      setAuthUser(TEST_USER);
      const body = (
        await request(server).get(`/partidos/${matchId}`).expect(200)
      ).body as {
        pending_requests: number | null;
        // ... other fields
      };
      expect(body.pending_requests).toBe(1);
      resetAuthUser();
    });

    it('[AC-7] pending_requests returns null for non-organizer', async () => {
      setAuthUser(OTHER_USER);
      const body = (
        await request(server).get(`/partidos/${matchId}`).expect(200)
      ).body as {
        pending_requests: number | null;
      };
      expect(body.pending_requests).toBeNull();
      resetAuthUser();
    });
    // Note: 401 test skipped due to harness limitation
  });
});
