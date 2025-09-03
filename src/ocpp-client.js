// ocpp-client.js
const WebSocket = require('ws');

// Cambiá esta URL si estás usando Render o localhost
const ws = new WebSocket('wss://ocpp-server-9e1v.onrender.com/ocpp');

ws.on('open', () => {
  console.log('🟢 Conectado al servidor OCPP');

  // Simular BootNotification
  sendOcppMessage(2, '123456', 'BootNotification', {
    chargePointModel: 'MyCharger',
    chargePointVendor: 'SALVATEC',
    chargePoint: 'SALVATEC-001',
    timestamp: new Date().toISOString()
  });

  // Simular Heartbeat después de 5 segundos
  setTimeout(() => {
    sendOcppMessage(2, '123457', 'Heartbeat', {
      chargePoint: 'SALVATEC-001',
      timestamp: new Date().toISOString()
    });
  }, 5000);

  // Simular Authorize después de 10 segundos
  setTimeout(() => {
    sendOcppMessage(2, '123458', 'Authorize', {
      idTag: 'ABC123',
      chargePoint: 'SALVATEC-001',
      timestamp: new Date().toISOString()
    });
  }, 10000);

  // Simular StartTransaction después de 15 segundos
  setTimeout(() => {
    sendOcppMessage(2, '123459', 'StartTransaction', {
      idTag: 'ABC123',
      meterStart: 0,
      connectorId: 1,
      chargePoint: 'SALVATEC-001',
      timestamp: new Date().toISOString()
    });
  }, 15000);
});

ws.on('message', (data) => {
  console.log('📨 Mensaje recibido del servidor:\n', data.toString());
});

ws.on('close', () => {
  console.log('🔴 Conexión cerrada');
});

ws.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

function sendOcppMessage(msgType, uniqueId, action, payload) {
  const message = [msgType, uniqueId, action, payload];
  console.log(`➡️ Enviando ${action}:`, JSON.stringify(message));
  ws.send(JSON.stringify(message));
}
