import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Reverse proxy ortida bo‘lsa cookie secure va ip uchun
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // ✅ cookie-parser: refresh token cookie’ni o‘qish uchun
  app.use(cookieParser());

  // ✅ xavfsizlik headerlar
  app.use(helmet({ contentSecurityPolicy: false }));

  // ✅ CORS: frontend bo‘lsa credentials kerak bo‘ladi
  app.enableCors({ origin: true, credentials: true });

  // ✅ class-validator + class-transformer ishlashi uchun global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO’da yo‘q fieldlarni olib tashlaydi
      forbidNonWhitelisted: true, // ortiqcha field bo‘lsa xato
      transform: true, // string -> number (query) kabi transformlar
    }),
  );

  // ✅ Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student System API')
    .setDescription('NestJS + Prisma 7 + PostgreSQL Student System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token: Authorization: Bearer <token>',
      },
      'access-token',
    )
    .build();

  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, doc, {
    swaggerOptions: {
      persistAuthorization: true, // ✅ tokenni saqlab turadi
    },
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`✅ Swagger: http://localhost:${port}/docs`);
  // eslint-disable-next-line no-console
  console.log(`✅ Server running: http://localhost:${port}`);
}

void bootstrap();
