import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();
  app.use(
    session({
      secret: 'trungpg',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
      },
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
