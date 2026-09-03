import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createUser } from './test.helper';
import { PrismaService } from 'src/lib/prisma/prisma.service';

describe('WorkspaceController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    user = await createUser(request, app);
  });

  it('should create a workspace', async () => {
    const res = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'test',
        slug: 'test',
      })
      .expect(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    workspace = res.body.data;
  });

  it('should get belonging workspaces', async () => {
    const res = await request(app.getHttpServer())
      .get('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('createdAt');
    expect(res.body.data[0]).toHaveProperty('updatedAt');
  });

  it('should update the workspace', async () => {
    const res = await request(app.getHttpServer())
      .put(`/workspaces/${workspace.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'test',
        slug: 'test',
      })
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('should get workspace by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspaces/${workspace.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('should add a member to the workspace', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspaces/${workspace.id}/members/add`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        email: user.email2,
        role: 'MEMBER',
      })
      .expect(201);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data).toHaveProperty('joinedAt');
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data).toHaveProperty('workSpaceId');
  });

  it('should get workspace members', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspaces/${workspace.id}/members`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('role');
    expect(res.body.data[0]).toHaveProperty('joinedAt');
    expect(res.body.data[0]).toHaveProperty('userId');
    expect(res.body.data[0]).toHaveProperty('workspaceId');
  });

  it('should update workspace member', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/workspaces/${workspace.id}/members/${user.id2}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        role: 'MEMBER',
      })
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data).toHaveProperty('joinedAt');
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data).toHaveProperty('workSpaceId');
  });

  it('should delete workspace member', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/workspaces/${workspace.id}/members/${user.id2}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data).toHaveProperty('joinedAt');
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data).toHaveProperty('workSpaceId');
  });

  it('should delete the workspace', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/workspaces/${workspace.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('should throw error if workspace is not found', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspaces/${workspace.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('WorkSpace not found');
  });

  afterAll(async () => {
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });
});
