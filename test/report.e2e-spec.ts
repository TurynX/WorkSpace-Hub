import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import request from 'supertest';
import { createProject, createUser, createWorkspace } from './test.helper';
import { AppModule } from 'src/app.module';

describe('ReportController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;
  let report: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    user = await createUser(request, app);
    workspace = await createWorkspace(request, app, user.token);
  });

  it('should create the report of a workspace', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/report/create`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'Report',
        type: 'WORKSPACE_SUMMARY',
      })
      .expect(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('type');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('fileKey');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('workspaceId');
    report = res.body.data;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('should not create if the user is not a member', async () => {
    await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/report/create`)
      .set('Authorization', `Bearer ${user.token2}`)
      .send({
        title: 'Report',
        type: 'WORKSPACE_SUMMARY',
      })
      .expect(403);
  });

  it('should get the download url', async () => {
    const res = await request(app.getHttpServer())
      .get(`/report/${report.id}/download`)
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('url');
  });

  it('should not download report if it does not exist', async () => {
    await request(app.getHttpServer())
      .get(`/report/${'invalid-id'}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
