import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/lib/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const name = `test_${Date.now()}`;
  const email = `${name}@gmail.com`;
  const password = 'password';

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

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    app.enableShutdownHooks();
  });

  it('should register the user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ fullName: name, email, password })
      .expect(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });
  it('should throw error if user is already registered', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ fullName: name, email, password })
      .expect(409);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('User already exists');
  });

  it('should login the user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should throw error if user is not registered', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `${name}_wrong@gmail.com`,
        password: 'wrong password',
      })
      .expect(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Invalid credentials');
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
