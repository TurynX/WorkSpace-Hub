import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import request from 'supertest';
import { createUser, createWorkspace } from './test.helper';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;
  let project: any;

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
    workspace = await createWorkspace(request, app, user.token);
  });
  it('should create a project', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/project/create`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'test',
        description: 'test',
      })
      .expect(201);

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('workspaceId');
    expect(res.body.data).toHaveProperty('tasks');
    expect(res.body.data).toHaveProperty('description');
    project = res.body.data;
  });

  it('should not create a project if the name is missing', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/project/create`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: 'test',
      })
      .expect(400);

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should not create a project if the workspace doesnt belong to the user', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspace/${workspace.id}/project/create`)
      .set('Authorization', `Bearer ${user.token2}`)
      .send({
        name: 'test',
        description: 'test',
      })
      .expect(403);

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should get all projects from workspace', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspace/${workspace.id}/projects`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('createdAt');
    expect(res.body.data[0]).toHaveProperty('updatedAt');
    expect(res.body.data[0]).toHaveProperty('workspaceId');
    expect(res.body.data[0]).toHaveProperty('tasks');
    expect(res.body.data[0]).toHaveProperty('description');
  });

  it('should get project by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspace/${workspace.id}/project/${project.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('workspaceId');
    expect(res.body.data).toHaveProperty('tasks');
    expect(res.body.data).toHaveProperty('description');
  });

  it('should update a project', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/workspace/${workspace.id}/project/${project.id}/update`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'test',
        description: 'test',
      })
      .expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('workspaceId');
    expect(res.body.data).toHaveProperty('tasks');
    expect(res.body.data).toHaveProperty('description');
  });

  it('should delete a project', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/workspace/${workspace.id}/project/${project.id}/delete`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('workspaceId');
    expect(res.body.data).toHaveProperty('tasks');
    expect(res.body.data).toHaveProperty('description');
  });

  afterAll(async () => {
    await prisma.project.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
