// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomWsAdapter } from './ws.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new CustomWsAdapter(app));

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`✅ Server listening on port ${PORT}`);
}
bootstrap();
