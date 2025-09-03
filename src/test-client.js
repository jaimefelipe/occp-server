const WebSocket = require('ws');

const socket = new WebSocket('wss://occp-server-9e1v.onrender.com/ocpp');

socket.on('open', () => {
  console.log('✅ Conectado al servidor');
  socket.send(JSON.stringify({
    action: 'BootNotification',
    chargePoint: 'SALVATEC-001',
    timestamp: new Date().toISOString()
  }));
});

socket.on('message', (data) => {
  console.log('📨 Mensaje recibido:', data.toString());
});

socket.on('close', () => {
  console.log('❌ Conexión cerrada');
});

socket.on('error', (err) => {
  console.error('❗ Error:', err);
});
