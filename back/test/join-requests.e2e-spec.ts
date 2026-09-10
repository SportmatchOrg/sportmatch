import request from 'supertest';
import {
  TestContext,
  closeTestApp,
  createTestApp,
  resetDatabase,
  setAuthUser,
} from './setup-e2e';
import {
  OTHER_USER,
  TEST_USER,
  partidoPayload,
  seedBaseline,
} from './fixtures';

type PublicUser = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
};

type JoinRequestResponse = {
  id: string;
  status: string;
  user: PublicUser;
};

type PartidoDetail = {
  id: string;
  anotados: number;
  my_join_request: string | null;
  pending_requests: number | null;
  participantes: PublicUser[];
};

type PartidoListItem = {
  id: string;
  pending_requests: number | null;
};

describe('join-requests SPO-197', () => {
  let ctx: TestContext;
  let deporteId: string;
  let otroId: string;
  let matchId: string;
  let joinRequestId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(ctx);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.prisma);
    const baseline = await seedBaseline(ctx.prisma);
    deporteId = baseline.deporteId;
    otroId = baseline.otroId;

    const created = await request(ctx.app.getHttpServer())
      .post('/partidos')
      .set('Authorization', `Bearer ${TEST_USER.uid}`)
      .send(partidoPayload(deporteId, { cupo: 2 }))
      .expect(201);
    matchId = created.body.id as string;

    setAuthUser(OTHER_USER);
    const createdRequest = await request(ctx.app.getHttpServer())
      .post(`/partidos/${matchId}/join-requests`)
      .send({})
      .expect(201);
    joinRequestId = createdRequest.body.id as string;
    setAuthUser(TEST_USER);
  });

  const getJoinRequests = async () => {
    const response = await request(ctx.app.getHttpServer())
      .get(`/partidos/${matchId}/join-requests`)
      .set('Authorization', `Bearer ${TEST_USER.uid}`)
      .expect(200);
    return response.body as JoinRequestResponse[];
  };

  const getDetail = async (user: typeof TEST_USER) => {
    const response = await request(ctx.app.getHttpServer())
      .get(`/partidos/${matchId}`)
      .set('Authorization', `Bearer ${user.uid}`)
      .expect(200);
    return response.body as PartidoDetail;
  };

  describe('GET /partidos/:matchId/join-requests', () => {
    it('[AC-1] organizer gets 200 with requester name and photo', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get(`/partidos/${matchId}/join-requests`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      const joinRequest = response.body[0] as JoinRequestResponse;
      expect(joinRequest.id).toBe(joinRequestId);
      expect(joinRequest.user).toEqual({
        id: otroId,
        nombre: OTHER_USER.nombre,
        fotoUrl: null,
      });
    });

    it('[AC-1] logged-in non-organizer gets 403', async () => {
      setAuthUser(OTHER_USER);
      await request(ctx.app.getHttpServer())
        .get(`/partidos/${matchId}/join-requests`)
        .set('Authorization', `Bearer ${OTHER_USER.uid}`)
        .expect(403);
      setAuthUser(TEST_USER);
    });

    it('[AC-2] response exposes neither email nor firebaseUid', async () => {
      const response = await request(ctx.app.getHttpServer())
        .get(`/partidos/${matchId}/join-requests`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .expect(200);
      const serialized = JSON.stringify(response.body);
      expect(serialized).not.toContain('email');
      expect(serialized).not.toContain('firebaseUid');
    });
  });

  describe('PATCH /partidos/:matchId/join-requests/:id', () => {
    it('[AC-3] accepting creates a participant and increments anotados', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      const detail = await getDetail(TEST_USER);
      expect(detail.anotados).toBe(1);
      expect(
        detail.participantes.some(({ id }) => id === otroId),
      ).toBe(true);

      setAuthUser(OTHER_USER);
      const requesterDetail = await getDetail(OTHER_USER);
      expect(requesterDetail.my_join_request).toBe('ACCEPTED');
      setAuthUser(TEST_USER);
    });

    it('[AC-4] rejecting creates no participant and updates my_join_request', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      const detail = await getDetail(TEST_USER);
      expect(detail.anotados).toBe(0);
      expect(
        detail.participantes.some(({ id }) => id === otroId),
      ).toBe(false);

      setAuthUser(OTHER_USER);
      const requesterDetail = await getDetail(OTHER_USER);
      expect(requesterDetail.my_join_request).toBe('REJECTED');
      setAuthUser(TEST_USER);
    });

    it('[AC-5] accepting a full match returns 409 and keeps PENDING', async () => {
      const fullUsers = await Promise.all([
        ctx.prisma.user.create({
          data: {
            firebaseUid: 'e2e-uid-full-one',
            email: 'full-one@e2e.test',
            nombre: 'Full One E2E',
          },
        }),
        ctx.prisma.user.create({
          data: {
            firebaseUid: 'e2e-uid-full-two',
            email: 'full-two@e2e.test',
            nombre: 'Full Two E2E',
          },
        }),
      ]);
      await Promise.all(
        fullUsers.map(({ id }) =>
          ctx.prisma.participante.create({
            data: { partidoId: matchId, usuarioId: id },
          }),
        ),
      );

      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);

      const joinRequests = await getJoinRequests();
      const pending = joinRequests.find(({ id }) => id === joinRequestId);
      expect(pending?.status).toBe('PENDING');
      const detail = await getDetail(TEST_USER);
      expect(detail.anotados).toBe(2);
      expect(
        detail.participantes.some(({ id }) => id === otroId),
      ).toBe(false);
    });

    it('[AC-6] resolving the same request twice returns 409', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(409);
    });

    it('[AC-6] PENDING in the body returns 400', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'PENDING' })
        .expect(400);
    });

    it('[AC-6] an unknown status returns 400', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'INVALIDO' })
        .expect(400);
    });

    it('[AC-6] a nonexistent request id returns 404', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/000000000000000000000000`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(404);
    });

    it('[AC-6] a request from another match returns 404', async () => {
      const otherMatch = await request(ctx.app.getHttpServer())
        .post('/partidos')
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send(partidoPayload(deporteId))
        .expect(201);

      await request(ctx.app.getHttpServer())
        .patch(
          `/partidos/${otherMatch.body.id as string}/join-requests/${joinRequestId}`,
        )
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(404);
    });

    it('[AC-6] an already played match returns 400', async () => {
      await ctx.prisma.partido.update({
        where: { id: matchId },
        data: { fecha: new Date(Date.now() - 86400000) },
      });

      await request(ctx.app.getHttpServer())
        .patch(`/partidos/${matchId}/join-requests/${joinRequestId}`)
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .send({ status: 'ACCEPTED' })
        .expect(400);
    });
  });

  describe('pending_requests', () => {
    it('[AC-7] organizer sees the real count and others see null', async () => {
      const secondRequester = {
        uid: 'e2e-uid-second-request',
        email: 'second-request@e2e.test',
        nombre: 'Second Request E2E',
      };
      await ctx.prisma.user.create({
        data: {
          firebaseUid: secondRequester.uid,
          email: secondRequester.email,
          nombre: secondRequester.nombre,
        },
      });
      setAuthUser(secondRequester);
      await request(ctx.app.getHttpServer())
        .post(`/partidos/${matchId}/join-requests`)
        .send({})
        .expect(201);
      setAuthUser(TEST_USER);

      const detail = await getDetail(TEST_USER);
      expect(detail.pending_requests).toBe(2);

      const mineResponse = await request(ctx.app.getHttpServer())
        .get('/partidos/mios')
        .set('Authorization', `Bearer ${TEST_USER.uid}`)
        .expect(200);
      const mine = mineResponse.body.organizo.find(
        (partido: PartidoListItem) => partido.id === matchId,
      ) as PartidoListItem;
      expect(mine.pending_requests).toBe(2);

      setAuthUser(OTHER_USER);
      const otherDetail = await getDetail(OTHER_USER);
      expect(otherDetail.pending_requests).toBeNull();

      const listViewer = {
        uid: 'e2e-uid-list-viewer',
        email: 'list-viewer@e2e.test',
        nombre: 'List Viewer E2E',
      };
      await ctx.prisma.user.create({
        data: {
          firebaseUid: listViewer.uid,
          email: listViewer.email,
          nombre: listViewer.nombre,
        },
      });
      setAuthUser(listViewer);
      const listResponse = await request(ctx.app.getHttpServer())
        .get('/partidos')
        .set('Authorization', `Bearer ${listViewer.uid}`)
        .expect(200);
      const listed = listResponse.body.find(
        (partido: PartidoListItem) => partido.id === matchId,
      ) as PartidoListItem;
      expect(listed.pending_requests).toBeNull();
      setAuthUser(TEST_USER);
    });
  });
});
