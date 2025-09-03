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
      try {
        const message = JSON.parse(data.toString());

        if (Array.isArray(message)) {
          const [msgType, uniqueId, action, payload] = message;

          if (msgType === 2 && action === 'BootNotification') {
            console.log('⚡ BootNotification recibido:', payload);

            // Aquí podés luego guardar el payload en tu base de datos vía API PHP
            const response = [
              3,
              uniqueId,
              {
                currentTime: new Date().toISOString(),
                interval: 300,
                status: "Accepted"
              }
            ];

            client.send(JSON.stringify(response));
          } else {
            console.log('🔔 Otro mensaje OCPP recibido:', message);
          }
        } else {
          console.log('❌ Formato no soportado:', message);
        }
      } catch (err) {
        console.error('❗ Error al procesar mensaje:', err.message);
      }
    });

  }

  handleDisconnect(client: WebSocket) {
    console.log('❌ Cliente desconectado');
  }
}