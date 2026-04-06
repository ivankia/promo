import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: (process.env.LOGGER_LEVEL
        ? process.env.LOGGER_LEVEL.split(',')
        : ['error']) as [],
    },
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());

  const logger = new Logger('Bootstrap');
  logger.log('Application is starting...');

  const config = new DocumentBuilder()
    .setTitle('Promo API')
    .setDescription('API для управления промокодами и их активацией')
    .setVersion('1.0')
    .addTag('Промокоды', 'Управление промокодами')
    .addTag('Активация', 'Активация промокодов пользователями')
    .addTag('Состояние сервиса', 'Проверка состояния сервиса')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);

  // Graceful shutdown
  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, async () => {
      logger.log('Starting graceful shutdown...');
      await app.close();
      logger.log('Application closed gracefully');
      process.exit(0);
    });
  });
}

bootstrap();
