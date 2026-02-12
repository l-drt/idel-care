import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('IDEL Care API')
    .setDescription('API SaaS suivi patient infirmiers libéraux')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et 2FA')
    .addTag('patients', 'Gestion des patients')
    .addTag('vitals', 'Constantes vitales')
    .addTag('care-activities', 'Activités de soins')
    .addTag('transmissions', 'Transmissions ciblées')
    .addTag('messages', 'Messagerie sécurisée')
    .addTag('tours', 'Gestion des tournées')
    .addTag('documents', 'Documents médicaux')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
