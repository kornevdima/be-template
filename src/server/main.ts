import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.enableShutdownHooks();
  app.useStaticAssets(join(__dirname, '..', 'client/public'));

  await app.listen(configService.get('PORT'));
  Logger.verbose(`Server is running on ${configService.get('PORT')}`);
}

bootstrap();
