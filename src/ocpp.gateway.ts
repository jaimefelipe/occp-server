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

    client.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (Array.isArray(message)) {
          const [msgType, uniqueId, action, payload] = message;

          if (msgType === 2 && typeof action === 'string') {
            console.log(`⚡ Acción OCPP recibida: ${action}`, payload);

            // === Enviar a backend Salvatec ===
            try {
              const res = await fetch('https://toxo.work/core/php/ocpp/registrarEvento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: action,
                  chargePoint: payload?.chargePoint || 'UNKNOWN',
                  timestamp: payload?.timestamp || new Date().toISOString(),
                  Id_Empresa: 1,
                  payload: payload
                }),
              });

              const respuesta = await res.json();
              console.log('📬 Evento registrado en Salvatec:', respuesta);
            } catch (err) {
              console.error('❌ Error al llamar al endpoint PHP:', err.message);
            }

            // === Enviar respuesta SOLO si es BootNotification ===
            if (action === 'BootNotification') {
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
            }
          } else {
            console.log('🔔 Mensaje recibido no válido para Call (msgType !== 2):', message);
          }
        } else {
          console.log('❌ Formato incorrecto (esperado array OCPP):', message);
        }
      } catch (err) {
        console.error('❗ Error procesando mensaje del cliente:', err.message);
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('❌ Cliente desconectado');
  }
}
