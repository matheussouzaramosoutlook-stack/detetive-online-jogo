const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = new Map();
app.use(express.static('public'));
app.get('/health', (_req, res) => res.json({ ok: true, game: 'Detetive Online' }));

const makeQuestion = () => {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  const op = Math.random() > 0.5 ? '+' : '×';
  return { text: op === '+' ? `${a} + ${b}` : `${a} × ${b}`, answer: op === '+' ? a + b : a * b };
};
const cleanName = value => String(value || 'Detetive').trim().replace(/[<>]/g, '').slice(0, 16) || 'Detetive';
const publicRoom = room => ({ code: room.code, hostId: room.hostId, started: room.started, players: [...room.players.values()].map(({ id, name, color, x, y, inCar }) => ({ id, name, color, x, y, inCar })) });
function leaveRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  if (room) {
    room.players.delete(socket.id);
    if (!room.players.size) rooms.delete(code);
    else {
      if (room.hostId === socket.id) room.hostId = room.players.keys().next().value;
      io.to(code).emit('room:update', publicRoom(room));
    }
  }
  socket.leave(code);
  socket.data.roomCode = null;
}
io.on('connection', socket => {
  socket.on('room:create', ({ name, color } = {}, reply = () => {}) => {
    leaveRoom(socket);
    let code;
    do { code = crypto.randomBytes(3).toString('hex').toUpperCase(); } while (rooms.has(code));
    const room = { code, hostId: socket.id, started: false, players: new Map(), question: makeQuestion(), solved: false };
    room.players.set(socket.id, { id: socket.id, name: cleanName(name), color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#36a2eb', x: 140, y: 160, inCar: false });
    rooms.set(code, room); socket.join(code); socket.data.roomCode = code;
    reply({ ok: true, room: publicRoom(room) });
  });
  socket.on('room:join', ({ code, name, color } = {}, reply = () => {}) => {
    leaveRoom(socket);
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room) return reply({ ok: false, error: 'Sala não encontrada. Confira o código.' });
    if (room.players.size >= 8) return reply({ ok: false, error: 'A sala está cheia (máximo de 8 jogadores).' });
    room.players.set(socket.id, { id: socket.id, name: cleanName(name), color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#36a2eb', x: 140 + Math.random() * 80, y: 160 + Math.random() * 80, inCar: false });
    socket.join(room.code); socket.data.roomCode = room.code;
    io.to(room.code).emit('room:update', publicRoom(room));
    reply({ ok: true, room: publicRoom(room) });
  });
  socket.on('game:start', (_data, reply = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return reply({ ok: false, error: 'Entre em uma sala primeiro.' });
    if (room.hostId !== socket.id) return reply({ ok: false, error: 'Somente o líder da sala pode iniciar.' });
    room.started = true; room.question = makeQuestion(); room.solved = false;
    io.to(room.code).emit('game:started', { question: room.question.text });
    io.to(room.code).emit('room:update', publicRoom(room));
    reply({ ok: true });
  });
  socket.on('player:move', ({ x, y, inCar } = {}) => {
    const room = rooms.get(socket.data.roomCode); if (!room || !room.started) return;
    const player = room.players.get(socket.id); if (!player) return;
    player.x = Math.max(28, Math.min(1172, Number(x) || player.x));
    player.y = Math.max(28, Math.min(772, Number(y) || player.y));
    player.inCar = !!inCar;
    socket.to(room.code).emit('player:moved', { id: socket.id, x: player.x, y: player.y, inCar: player.inCar });
  });
  socket.on('mission:answer', ({ answer } = {}, reply = () => {}) => {
    const room = rooms.get(socket.data.roomCode); if (!room || !room.started) return reply({ ok: false, error: 'A partida ainda não começou.' });
    if (room.solved) return reply({ ok: true, solved: true, message: 'Mistério resolvido!' });
    if (Number(answer) === room.question.answer) {
      room.solved = true;
      io.to(room.code).emit('mission:solved', { by: cleanName(room.players.get(socket.id)?.name) });
      reply({ ok: true, solved: true });
    } else reply({ ok: false, error: 'Resposta incorreta. Tente novamente!' });
  });
  socket.on('disconnect', () => leaveRoom(socket));
});
server.listen(PORT, '0.0.0.0', () => console.log(`Detetive Online rodando na porta ${PORT}`));
