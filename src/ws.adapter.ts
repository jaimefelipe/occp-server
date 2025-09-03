// src/adapters/ws.adapter.ts
import { INestApplication, Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

export class CustomWsAdapter extends WsAdapter {
  constructor(app: INestApplication) {
    super(app);
    Logger.log('✅ WebSocket adapter inicializado');
  }
}
