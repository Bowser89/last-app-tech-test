import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.APP_PORT ?? 5000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(5000);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap().catch((): void => {
  process.exit(1);
});
