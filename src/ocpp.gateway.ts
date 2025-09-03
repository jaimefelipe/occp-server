// src/ocpp.gateway.ts
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebSocket, Server } from 'ws';
import fetch from 'node-fetch';

@WebSocketGateway({ path: '/ocpp' })
export class OcppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: WebSocket) {
    console.log('📡 Cliente conectado');
    client.send(JSON.stringify({ msg: 'Bienvenido desde Salvatec OCPP Server' }));

    client.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (Array.isArray(message)) {
          const [msgType, uniqueId, action, payload] = message;

          if (msgType === 2 && action === 'BootNotification') {
            console.log('⚡ BootNotification recibido:', payload);

            /**Fetch */
            try {
              await fetch('https://toxo.work/core/php/ocpp/registrarEvento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: action,
                  chargePoint: payload.chargePoint,
                  timestamp: payload.timestamp,
                  Id_Empresa: 1, // Cambiar si querés detectar por cargador
                  payload: payload // Opcional: enviar todo
                }),
              }).then(async res => {
                const response = await res.json();
                console.log('📬 Evento registrado en Salvatec:', response);
              }).catch(err => {
                console.error('❌ Error al llamar al endpoint PHP:', err.message);
              });
            } catch (err) {
              console.error('❗ Error general al enviar evento al backend:', err.message);
            }
            /**Fin Fetch */

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