const WebSocket = require('ws');

const socket = new WebSocket('wss://occp-server-9e1v.onrender.com/ocpp');

socket.on('open', () => {
  console.log('✅ Conectado al servidor');

  const message = [
    2,                                // msgType: Call
    '123456',                         // uniqueId
    'BootNotification',              // action
    {
      chargePoint: 'SALVATEC-001',   // payload
      timestamp: new Date().toISOString()
    }
  ];

  socket.send(JSON.stringify(message));
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
