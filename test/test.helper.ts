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
