import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import {
  addMemberToWorkspace,
  createProject,
  createTask,
  createUser,
  createWorkspace,
  deleteTask,
  deleteWorkspaceMember,
  generateReport,
  updateTask,
  updateWorkspaceMember,
} from './test.helper';
import request from 'supertest';

describe('Audit Log', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: any;
  let workspace: any;
  let project: any;
  let task: any;

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

    project = await createProject(request, app, user.token, workspace.id);

    task = await createTask(request, app, user.token, project.id);

    await updateTask(request, app, user.token, project.id, task.id);

    await deleteTask(request, app, user.token, project.id, task.id);

    await addMemberToWorkspace(
      request,
      app,
      user.token,
      workspace.id,
      user.email2,
    );

    await updateWorkspaceMember(
      request,
      app,
      user.token,
      workspace.id,
      user.id2,
    );

    await generateReport(request, app, user.token, workspace.id);
  });

  it('should get workspace audit logs', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workspace/${workspace.id}/audit-logs`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject([
      { action: 'WORKSPACE_CREATED', workspaceId: workspace.id },
      { action: 'PROJECT_CREATED', workspaceId: workspace.id },
      { action: 'TASK_CREATED', workspaceId: workspace.id },
      { action: 'TASK_UPDATED', workspaceId: workspace.id },
      { action: 'TASK_DELETED', workspaceId: workspace.id },
      { action: 'MEMBER_INVITED', workspaceId: workspace.id },
      { action: 'MEMBER_ROLE_CHANGED', workspaceId: workspace.id },
      { action: 'REPORT_GENERATED', workspaceId: workspace.id },
    ]);
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.report.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });
});
