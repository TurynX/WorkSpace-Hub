import { ReportType, WorkspaceRole } from '@prisma/client';

export async function createUser(request: any, app: any) {
  let fullName = `test_${Date.now()}`;
  let email = `${fullName}@gmail.com`;
  let password = 'password';

  let fullName2 = `test2_${Date.now()}`;
  let email2 = `${fullName2}@gmail.com`;
  let password2 = 'password';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ fullName, email, password })
    .expect(201);

  const loginRes1 = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ fullName: fullName2, email: email2, password: password2 })
    .expect(201);

  const loginRes2 = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: email2, password: password2 })
    .expect(200);

  return {
    email,
    password,
    token: loginRes1.body.data.token,
    token2: loginRes2.body.data.token,
    id2: loginRes2.body.data.user.id,
    email2,
    password2,
  };
}

export async function createWorkspace(request: any, app: any, token: string) {
  const res = await request(app.getHttpServer())
    .post('/workspaces')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `workspace_${Date.now()}`,
      slug: `workspace_${Date.now()}`,
    });

  return res.body.data;
}

export async function updateWorkspace(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
) {
  const res = await request(app.getHttpServer())
    .put(`/workspaces/${workspaceId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `workspace_${Date.now()}`, slug: `workspace_${Date.now()}` })
    .expect(200);

  return res.body.data;
}

export async function deleteWorkspace(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
) {
  const res = await request(app.getHttpServer())
    .delete(`/workspaces/${workspaceId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
}

export async function addMemberToWorkspace(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
  email: string,
) {
  const res = await request(app.getHttpServer())
    .post(`/workspaces/${workspaceId}/members/add`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      email,
    })

    .expect(201);

  return res.body.data;
}

export async function updateWorkspaceMember(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
  memberId: string,
) {
  const res = await request(app.getHttpServer())
    .patch(`/workspaces/${workspaceId}/members/${memberId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      role: WorkspaceRole.MEMBER,
    })
    .expect(200);

  return res.body.data;
}

export async function deleteWorkspaceMember(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
  memberId: string,
) {
  const res = await request(app.getHttpServer())
    .delete(`/workspaces/${workspaceId}/members/${memberId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
}

export async function createProject(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
  description = `project_${Date.now()}`,
  name = `project_${Date.now()}`,
) {
  const res = await request(app.getHttpServer())
    .post(`/workspace/${workspaceId}/project/create`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description })
    .expect(201);

  return res.body.data;
}

export async function updateProject(
  request: any,
  app: any,
  token: string,
  projectId: string,
) {
  const res = await request(app.getHttpServer())
    .put(`/project/${projectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `project_${Date.now()}`,
      description: `project_${Date.now()}`,
    })
    .expect(200);

  return res.body.data;
}

export async function deleteProject(
  request: any,
  app: any,
  token: string,
  projectId: string,
) {
  const res = await request(app.getHttpServer())
    .delete(`/project/${projectId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
}

export async function createTask(
  request: any,
  app: any,
  token: string,
  projectId: string,
  title = `task_${Date.now()}`,
  description = `task_${Date.now()}`,
  priority = 'MEDIUM',
) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const res = await request(app.getHttpServer())
    .post(`/project/${projectId}/task/create`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title,
      description,
      dueDate,
      priority,
    })
    .expect(201);

  return res.body.data;
}

export async function updateTask(
  request: any,
  app: any,
  token: string,
  projectId: string,
  taskId: string,
) {
  const res = await request(app.getHttpServer())
    .put(`/project/${projectId}/task/${taskId}/update`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: `task_${Date.now()}`,
      description: `task_${Date.now()}`,
    })
    .expect(200);

  return res.body.data;
}

export async function deleteTask(
  request: any,
  app: any,
  token: string,
  projectId: string,
  taskId: string,
) {
  const res = await request(app.getHttpServer())
    .delete(`/project/${projectId}/task/${taskId}/delete`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return res.body.data;
}

export async function generateReport(
  request: any,
  app: any,
  token: string,
  workspaceId: string,
) {
  const res = await request(app.getHttpServer())
    .post(`/workspace/${workspaceId}/report/create`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      type: ReportType.WORKSPACE_SUMMARY,
      title: `report_ ${Date.now()}`,
    })
    .expect(201);

  return res.body.data;
}
