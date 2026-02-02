import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('CarMetrics')
    .setDescription('CarMetricsApp')
    .setVersion('1.0')
    .addTag('car')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Omogući cors da front-end može da pristupi API-ju
  app.enableCors();

  // Pokreni server na portu iz .env ili 3000
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
