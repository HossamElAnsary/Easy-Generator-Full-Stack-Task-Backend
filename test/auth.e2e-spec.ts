import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // mirror your main.ts setup
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) should register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@example.com',
        name: 'Tester',
        password: 'P@ssw0rd!',
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('_id');
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/auth/signin (POST) should return a JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'P@ssw0rd!' })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('access_token');
        jwtToken = res.body.access_token;
      });
  });

  it('/profile (GET) should be protected', () => {
    return request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('/profile (GET) should return data with valid token', () => {
    return request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          message: 'Welcome to the protected route!',
        });
      });
  });
});
