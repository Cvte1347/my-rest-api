import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  app.enableCors({ origin: '*' });

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Manga REST API')
    .setDescription('API для работы с мангой и пользователями')
    .setVersion('1.0')
    .addTag('manga', 'Операции с мангой')
    .addTag('users', 'Операции с пользователями')
    .addTag('covers', 'Операции с обложками манги')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`[Backend] started at port: ${process.env.PORT ?? 3000}`);
  Logger.log(
    `[Swagger] Documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
};

void bootstrap();
