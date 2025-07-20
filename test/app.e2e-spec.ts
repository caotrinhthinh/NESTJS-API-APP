import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.listen(PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();

    pactum.request.setBaseUrl(BASE_URL);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    describe('Register', () => {
      it('should register a new user', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: 'testuser@example.com',
            password: '12345678',
          })
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should login with valid credentials', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'testuser@example.com',
            password: '12345678',
          })
          .expectStatus(200)
          .stores('accessToken', 'access_token'); //Lưu access_token vào biến $S{accessToken}
      });
    });

    describe('Get Profile', () => {
      it('should get current user profile', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Note', () => {
    describe('Insert Note', () => {});
    describe('Get all Notes', () => {});
    describe('Get Note by Id', () => {});
    describe('Delete Note by Id', () => {});
  });
});
