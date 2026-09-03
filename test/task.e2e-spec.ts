import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { createProject, createUser, createWorkspace } from './test.helper';
import request from 'supertest';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;
  let project: any;
  let task: any;

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
    project = await createProject(request, app, user.token, workspace.id);
  });

  it('should create a task', async () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const res = await request(app.getHttpServer())
      .post(`/project/${project.id}/task/create`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: `task_${Date.now()}`,
        description: `task_${Date.now()}`,
        priority: 'HIGH',
        dueDate: sevenDaysFromNow,
      })
      .expect(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('priority');
    expect(res.body.data).toHaveProperty('dueDate');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('projectId');
    expect(res.body.data).toHaveProperty('creatorId');
    expect(res.body.data).toHaveProperty('assigneeId');
    task = res.body.data;
  });

  it('should not create if creator is not a member', async () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const res = await request(app.getHttpServer())
      .post(`/project/${project.id}/task/create`)
      .set('Authorization', `Bearer ${user.token2}`)
      .send({
        title: `task_${Date.now()}`,
        description: `task_${Date.now()}`,
        priority: 'HIGH',
        dueDate: sevenDaysFromNow,
      })
      .expect(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should not create a task if the title is missing', async () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const res = await request(app.getHttpServer())
      .post(`/project/${project.id}/task/create`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: `task_${Date.now()}`,
        priority: 'HIGH',
        dueDate: sevenDaysFromNow,
      })
      .expect(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should get all tasks from a project', async () => {
    const res = await request(app.getHttpServer())
      .get(`/project/${project.id}/tasks`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('description');
    expect(res.body.data[0]).toHaveProperty('status');
    expect(res.body.data[0]).toHaveProperty('priority');
    expect(res.body.data[0]).toHaveProperty('dueDate');
    expect(res.body.data[0]).toHaveProperty('createdAt');
    expect(res.body.data[0]).toHaveProperty('updatedAt');
    expect(res.body.data[0]).toHaveProperty('projectId');
    expect(res.body.data[0]).toHaveProperty('creatorId');
    expect(res.body.data[0]).toHaveProperty('assigneeId');
  });

  it('should get a task by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/project/${project.id}/task/${task.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('priority');
    expect(res.body.data).toHaveProperty('dueDate');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('projectId');
    expect(res.body.data).toHaveProperty('creatorId');
    expect(res.body.data).toHaveProperty('assigneeId');
  });

  it('should not get a task by id if the task does not exist', async () => {
    const res = await request(app.getHttpServer())
      .get(`/project/${project.id}/task/invalid-id`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should update a task', async () => {
    const res = await request(app.getHttpServer())
      .put(`/project/${project.id}/task/${task.id}/update`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: `updated_task_${Date.now()}`,
        description: `updated_task_${Date.now()}`,
        priority: 'LOW',
      })
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('priority');
    expect(res.body.data).toHaveProperty('dueDate');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('projectId');
    expect(res.body.data).toHaveProperty('creatorId');
    expect(res.body.data).toHaveProperty('assigneeId');
  });

  it('should delete a task', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/project/${project.id}/task/${task.id}/delete`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('description');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('priority');
    expect(res.body.data).toHaveProperty('dueDate');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data).toHaveProperty('projectId');
    expect(res.body.data).toHaveProperty('creatorId');
    expect(res.body.data).toHaveProperty('assigneeId');
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
