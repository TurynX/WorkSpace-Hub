import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import {
  createProject,
  createTask,
  createUser,
  createWorkspace,
} from './test.helper';
import request from 'supertest';

describe('AttachmentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;
  let project: any;
  let task: any;
  let attachment: any;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    user = await createUser(request, app);
    workspace = await createWorkspace(request, app, user.token);
    project = await createProject(request, app, user.token, workspace.id);
    task = await createTask(request, app, user.token, project.id);
  });

  it('should upload an attachment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/task/${task.id}/attachment/upload`)
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', Buffer.from('hello world'), {
        filename: 'init.txt',
        contentType: 'text/plain',
      })
      .expect(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('fileName');
    expect(res.body.data).toHaveProperty('fileKey');
    expect(res.body.data).toHaveProperty('mimeType');
    expect(res.body.data).toHaveProperty('fileSize');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('taskId');
    attachment = res.body.data;
  });

  it('should not upload attachment if the user is not a member of the workspace', async () => {
    const res = await request(app.getHttpServer())
      .post(`/task/${task.id}/attachment/upload`)
      .set('Authorization', `Bearer ${user.token2}`)
      .attach('file', Buffer.from('hello world'), {
        filename: 'init.txt',
        contentType: 'text/plain',
      })
      .expect(403);
  });

  it('should not upload attachment if its too large', async () => {
    const res = await request(app.getHttpServer())
      .post(`/task/${task.id}/attachment/upload`)
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', Buffer.from('hello'.repeat(10 * 1024 * 1024 + 1)), {
        filename: 'init.txt',
        contentType: 'text/plain',
      })
      .expect(413);
  });

  it('should get all task attachments', async () => {
    const res = await request(app.getHttpServer())
      .get(`/task/${task.id}/attachments`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('fileName');
    expect(res.body.data[0]).toHaveProperty('fileKey');
    expect(res.body.data[0]).toHaveProperty('mimeType');
    expect(res.body.data[0]).toHaveProperty('fileSize');
    expect(res.body.data[0]).toHaveProperty('createdAt');
    expect(res.body.data[0]).toHaveProperty('taskId');
  });

  it('should get download url', async () => {
    const res = await request(app.getHttpServer())
      .get(`/attachment/${attachment.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('url');
  });

  it('should delete an attachment', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/attachment/${attachment.id}/delete`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('fileName');
    expect(res.body.data).toHaveProperty('fileKey');
    expect(res.body.data).toHaveProperty('mimeType');
    expect(res.body.data).toHaveProperty('fileSize');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('taskId');
  });

  it('should not get attachment no exists', async () => {
    const res = await request(app.getHttpServer())
      .get(`/attachment/${attachment.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  it('should not delete attachment no exists', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/attachment/${attachment.id}/delete`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  afterAll(async () => {
    await prisma.attachment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });
});
