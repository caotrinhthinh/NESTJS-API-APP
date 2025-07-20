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
          .expectStatus(200)
          .stores('userId', 'id');
        // .inspect()
      });
    });
  });

  describe('Note', () => {
    describe('Insert Note', () => {
      it('should insert first note', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody({
            title: 'My first note',
            description: 'Test note content 1',
            url: 'https://example.com',
          })
          .expectStatus(201)
          .stores('noteId1', 'id'); // Lưu id vào biến ${noteId1}
      });

      it('should insert second note', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({ Authorization: `Bearer $S{accessToken}` })
          .withBody({
            title: 'My second note',
            description: 'Test note content 2',
            url: 'https://example.com/2',
          })
          .expectStatus(201)
          .stores('noteId2', 'id');
      });
    });
    describe('Get all Notes', () => {
      it('should return notes for logged-in user', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .expectJsonLength(2);
      });
    });
    describe('Get Note by Id', () => {
      it('should return the note with specific id', () => {
        return pactum
          .spec()
          .get('/notes/$S{noteId1}')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains('My first note');
      });
    });
    describe('Update Note', () => {
      it('should update the note', () => {
        return pactum
          .spec()
          .patch('/notes/{id}')
          .withPathParams('id', '$S{noteId1}')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .withBody({
            title: 'Updated title',
          })
          .expectStatus(200)
          .expectBodyContains('Updated title');
      });
    });
    describe('Delete Note by Id', () => {
      it('should delete the note', () => {
        return pactum
          .spec()
          .delete('/notes/$S{noteId1}')
          .withHeaders({
            Authorization: `Bearer $S{accessToken}`,
          })
          .expectStatus(204);
      });

      it('should return 404 when getting deleted note', () => {
        return pactum
          .spec()
          .get('/notes/$S{noteId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(404);
      });
    });
  });
});
