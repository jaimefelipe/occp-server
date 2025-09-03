// src/ocpp.gateway.ts
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';

@WebSocketGateway({ path: '/ocpp' })
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: WebSocket) {
    console.log('📡 Cliente conectado');
    client.send(JSON.stringify({ msg: 'Bienvenido desde Salvatec OCPP Server' }));

    client.on('message', (data) => {
      const message = data.toString();
      console.log('📩 Mensaje recibido:', message);

      // Podés parsear y responder según el tipo de mensaje OCPP
      client.send(JSON.stringify({ ok: true, received: message }));
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('❌ Cliente desconectado');
  }
}