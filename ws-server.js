// ws-server.js
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();

const wss = new WebSocket('wss://awanaevent.com/ws');

wss.on('connection', (ws) => {
  console.log('✅ WebSocket 연결됨');

  ws.send(JSON.stringify({ type: 'welcome', data: '서버에 연결되었습니다.' }));

  ws.on('message', (msg) => {
    console.log('📨 받은 메시지:', msg.toString());
    ws.send(JSON.stringify({ type: 'echo', data: msg.toString() }));
  });

  ws.on('close', () => {
    console.log('❌ WebSocket 연결 종료');
  });
});

server.listen(4000, () => {
  console.log('📡 WebSocket 서버가 4000번 포트에서 실행 중');
});
