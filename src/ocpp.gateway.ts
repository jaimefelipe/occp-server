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
            console.log(`⚡ ${action} recibido:`, payload);

            // Registrar evento en PHP
            await this.registrarEvento(action, payload);

            // Construir respuesta (tipo 3 = respuesta a petición tipo 2)
            const response = [
              3,
              uniqueId,
              this.generarRespuesta(action),
            ];

            client.send(JSON.stringify(response));
          } else {
            console.log('🔔 Otro mensaje OCPP recibido:', message);
          }
        } else {
          console.log('❌ Formato OCPP inválido (no es array):', message);
        }
      } catch (err) {
        console.error('❗ Error al procesar mensaje:', err.message);
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('❌ Cliente desconectado');
  }

  private async registrarEvento(action: string, payload: any) {
    try {
      const body = {
        action,
        chargePoint: payload?.chargePoint || 'UNKNOWN',
        timestamp: payload?.timestamp || new Date().toISOString(),
        Id_Empresa: 1,
        payload
      };

      const res = await fetch('https://toxo.work/core/php/ocpp/registrarEvento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      console.log('📬 Evento registrado en Salvatec:', result);
    } catch (err) {
      console.error('❌ Error al enviar evento al backend PHP:', err.message);
    }
  }

  private generarRespuesta(action: string) {
    switch (action) {
      case 'BootNotification':
        return {
          currentTime: new Date().toISOString(),
          interval: 300,
          status: 'Accepted'
        };
      case 'Heartbeat':
        return {
          currentTime: new Date().toISOString()
        };
      case 'Authorize':
        return {
          idTagInfo: {
            status: 'Accepted'
          }
        };
      case 'StartTransaction':
        return {
          transactionId: Math.floor(Math.random() * 10000),
          idTagInfo: {
            status: 'Accepted'
          }
        };
      default:
        return { status: 'Accepted' };
    }
  }
}
