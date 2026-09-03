import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SubscriptionTier } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import request from 'supertest';
import { createUser, createWorkspace } from './test.helper';

describe('SubscriptionController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    user = await createUser(request, app);
    workspace = await createWorkspace(request, app, user.token);
  });

  it('should upgrade subscription', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/subscription/upgrade`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ tier: SubscriptionTier.PRO });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('url');
    expect(typeof res.body.data.url).toBe('string');
  });

  it('should get subscription', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspace/${workspace.id}/subscription`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('subscription');
    expect(res.body.data.subscription).toMatchObject({
      id: expect.any(String),
      tier: SubscriptionTier.FREE,
      isActive: true,
      currentPeriodEnd: null,
      workspaceId: workspace.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
  });

  it('should not get subcription if the user do not belongs to the workspace', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspace/${workspace.id}/subscription`)
      .set('Authorization', `Bearer ${user.token2}`);
    expect(res.status).toBe(403);
  });

  afterAll(async () => {
    await prisma.subscription.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });
});
