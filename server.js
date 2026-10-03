/* ============================================
   سيرفر لعبة خمّن شنو بيدك
   ============================================ */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (_, res) => res.send('Headbanz Server is running'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

const rooms = new Map();
const players = new Map();

/* ============ بيانات البطاقات ============ */
const CARDS = [
  { name: 'قطة', category: 'animals', difficulty: 1 },
  { name: 'كلب', category: 'animals', difficulty: 1 },
  { name: 'فيل', category: 'animals', difficulty: 1 },
  { name: 'أسد', category: 'animals', difficulty: 1 },
  { name: 'زرافة', category: 'animals', difficulty: 2 },
  { name: 'قرد', category: 'animals', difficulty: 1 },
  { name: 'دب', category: 'animals', difficulty: 1 },
  { name: 'أرنب', category: 'animals', difficulty: 1 },
  { name: 'حصان', category: 'animals', difficulty: 1 },
  { name: 'جمل', category: 'animals', difficulty: 1 },
  { name: 'دلفين', category: 'animals', difficulty: 2 },
  { name: 'حوت', category: 'animals', difficulty: 2 },
  { name: 'نسر', category: 'animals', difficulty: 2 },
  { name: 'بومة', category: 'animals', difficulty: 2 },
  { name: 'ثعبان', category: 'animals', difficulty: 2 },
  { name: 'سلحفاة', category: 'animals', difficulty: 2 },
  { name: 'ضفدع', category: 'animals', difficulty: 1 },
  { name: 'فراشة', category: 'animals', difficulty: 2 },
  { name: 'نحلة', category: 'animals', difficulty: 1 },
  { name: 'عنكبوت', category: 'animals', difficulty: 2 },
  { name: 'تفاحة', category: 'food', difficulty: 1 },
  { name: 'موز', category: 'food', difficulty: 1 },
  { name: 'برتقال', category: 'food', difficulty: 1 },
  { name: 'عنب', category: 'food', difficulty: 1 },
  { name: 'بطيخ', category: 'food', difficulty: 1 },
  { name: 'فراولة', category: 'food', difficulty: 1 },
  { name: 'بيتزا', category: 'food', difficulty: 1 },
  { name: 'برغر', category: 'food', difficulty: 1 },
  { name: 'شاورما', category: 'food', difficulty: 1 },
  { name: 'كباب', category: 'food', difficulty: 1 },
  { name: 'شاي', category: 'food', difficulty: 1 },
  { name: 'قهوة', category: 'food', difficulty: 1 },
  { name: 'آيس كريم', category: 'food', difficulty: 1 },
  { name: 'كيك', category: 'food', difficulty: 1 },
  { name: 'شوكولاتة', category: 'food', difficulty: 1 },
  { name: 'خبز', category: 'food', difficulty: 1 },
  { name: 'عسل', category: 'food', difficulty: 1 },
  { name: 'ليمون', category: 'food', difficulty: 1 },
  { name: 'كرسي', category: 'objects', difficulty: 1 },
  { name: 'طاولة', category: 'objects', difficulty: 1 },
  { name: 'سرير', category: 'objects', difficulty: 1 },
  { name: 'باب', category: 'objects', difficulty: 1 },
  { name: 'نافذة', category: 'objects', difficulty: 1 },
  { name: 'مفتاح', category: 'objects', difficulty: 1 },
  { name: 'ساعة', category: 'objects', difficulty: 1 },
  { name: 'نظارة', category: 'objects', difficulty: 1 },
  { name: 'حذاء', category: 'objects', difficulty: 1 },
  { name: 'قبعة', category: 'objects', difficulty: 1 },
  { name: 'حقيبة', category: 'objects', difficulty: 1 },
  { name: 'مظلة', category: 'objects', difficulty: 1 },
  { name: 'صابون', category: 'objects', difficulty: 1 },
  { name: 'مرآة', category: 'objects', difficulty: 1 },
  { name: 'مصباح', category: 'objects', difficulty: 1 },
  { name: 'تلفون', category: 'objects', difficulty: 1 },
  { name: 'تلفزيون', category: 'objects', difficulty: 1 },
  { name: 'ثلاجة', category: 'objects', difficulty: 2 },
  { name: 'غسالة', category: 'objects', difficulty: 2 },
  { name: 'سيارة', category: 'vehicles', difficulty: 1 },
  { name: 'باص', category: 'vehicles', difficulty: 1 },
  { name: 'طائرة', category: 'vehicles', difficulty: 1 },
  { name: 'قطار', category: 'vehicles', difficulty: 1 },
  { name: 'سفينة', category: 'vehicles', difficulty: 1 },
  { name: 'دراجة', category: 'vehicles', difficulty: 1 },
  { name: 'صاروخ', category: 'vehicles', difficulty: 1 },
  { name: 'شمس', category: 'nature', difficulty: 1 },
  { name: 'قمر', category: 'nature', difficulty: 1 },
  { name: 'نجمة', category: 'nature', difficulty: 1 },
  { name: 'مطر', category: 'nature', difficulty: 1 },
  { name: 'شجرة', category: 'nature', difficulty: 1 },
  { name: 'زهرة', category: 'nature', difficulty: 1 },
  { name: 'بحر', category: 'nature', difficulty: 1 },
  { name: 'جبل', category: 'nature', difficulty: 1 },
  { name: 'نار', category: 'nature', difficulty: 1 },
  { name: 'طبيب', category: 'jobs', difficulty: 1 },
  { name: 'معلم', category: 'jobs', difficulty: 1 },
  { name: 'مهندس', category: 'jobs', difficulty: 2 },
  { name: 'شرطي', category: 'jobs', difficulty: 1 },
  { name: 'طيار', category: 'jobs', difficulty: 1 },
  { name: 'طباخ', category: 'jobs', difficulty: 1 },
  { name: 'مزارع', category: 'jobs', difficulty: 1 },
  { name: 'فنان', category: 'jobs', difficulty: 1 }
];

/* ============ أدوات ============ */
function genCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}
function drawCard(categories = ['all']) {
  let pool = CARDS;
  if (!categories.includes('all')) {
    pool = CARDS.filter(c => categories.includes(c.category));
    if (!pool.length) pool = CARDS;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
function normalize(s) {
  return String(s || '').trim()
    .replace(/[أإآ]/g, 'ا').replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه').replace(/\s+/g, ' ').toLowerCase();
}
function serializeRoom(r) {
  return {
    code: r.code,
    hostId: r.hostId,
    players: r.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar })),
    options: r.options,
    state: r.state
  };
}

/* ============ الاتصال ============ */
io.on('connection', (socket) => {
  console.log('connect:', socket.id);

  socket.on('player:hello', (data) => {
    players.set(socket.id, {
      id: socket.id,
      name: String(data?.name || 'لاعب').slice(0, 20),
      avatar: String(data?.avatar || 'a_default'),
      room: null
    });
    socket.emit('player:ready', { id: socket.id });
  });

  socket.on('room:create', (opts, cb) => {
    cb = cb || function () {};
    const player = players.get(socket.id);
    if (!player) return cb({ error: 'no_player' });

    const code = genCode();
    const room = {
      code,
      hostId: socket.id,
      players: [player],
      options: {
        rounds: opts?.rounds || 5,
        turnTime: opts?.turnTime || 60,
        categories: opts?.categories || ['all']
      },
      state: 'waiting',
      game: null,
      messages: []
    };
    player.room = code;
    rooms.set(code, room);
    socket.join(code);

    cb({ ok: true, room: serializeRoom(room) });
    io.to(code).emit('room:update', serializeRoom(room));
  });

  socket.on('room:join', (code, cb) => {
    cb = cb || function () {};
    code = String(code || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return cb({ error: 'not_found' });
    if (room.state !== 'waiting') return cb({ error: 'in_progress' });
    if (room.players.length >= 8) return cb({ error: 'full' });

    const player = players.get(socket.id);
    if (!player) return cb({ error: 'no_player' });
    if (room.players.find(p => p.id === player.id))
      return cb({ ok: true, room: serializeRoom(room) });

    room.players.push(player);
    player.room = code;
    socket.join(code);

    cb({ ok: true, room: serializeRoom(room) });
    io.to(code).emit('room:update', serializeRoom(room));
    io.to(code).emit('chat:sys', { text: `${player.name} انضم للغرفة` });
  });

  socket.on('room:leave', () => removeFromRoom(socket));

  socket.on('game:start', () => {
    const player = players.get(socket.id);
    const room = rooms.get(player?.room);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) return;
    startGame(room);
  });

  socket.on('chat:msg', (text) => {
    const player = players.get(socket.id);
    const room = rooms.get(player?.room);
    if (!room || !text) return;
    const msg = {
      id: Date.now() + Math.random(),
      from: player.name, avatar: player.avatar,
      text: String(text).slice(0, 200), ts: Date.now()
    };
    room.messages.push(msg);
    if (room.messages.length > 100) room.messages.shift();
    io.to(room.code).emit('chat:msg', msg);
  });

  socket.on('game:ask', (text) => {
    const player = players.get(socket.id);
    const room = rooms.get(player?.room);
    if (!room?.game) return;
    if (room.game.turnPlayerId !== socket.id) return;
    if (room.game.phase !== 'playing') return;
    const entry = {
      type: 'question', from: player.name, fromId: socket.id,
      text: String(text || '').slice(0, 200), ts: Date.now()
    };
    room.game.history.push(entry);
    io.to(room.code).emit('game:event', entry);
  });

  socket.on('game:answer', (yesNo) => {
    const player = players.get(socket.id);
    const room = rooms.get(player?.room);
    if (!room?.game) return;
    if (room.game.turnPlayerId === socket.id) return;
    if (room.game.phase !== 'playing') return;
    const entry = {
      type: 'answer', fromId: socket.id,
      value: !!yesNo, text: yesNo ? 'نعم' : 'لا', ts: Date.now()
    };
    room.game.history.push(entry);
    io.to(room.code).emit('game:event', entry);
  });

  socket.on('game:guess', (name) => {
    const player = players.get(socket.id);
    const room = rooms.get(player?.room);
    if (!room?.game) return;
    if (room.game.turnPlayerId !== socket.id) return;
    if (room.game.phase !== 'playing') return;

    const card = room.game.cards[socket.id];
    const isCorrect = normalize(name) === normalize(card.name);
    const pl = room.game.scores[socket.id];

    if (isCorrect) {
      const pts = 100 + room.game.timeLeft * 2 + (card.difficulty || 1) * 15;
      pl.score += pts;
      pl.correct++;
      io.to(room.code).emit('game:correct', {
        playerId: socket.id, name: player.name,
        card, points: pts, timeLeft: room.game.timeLeft
      });
      room.game.phase = 'paused';
      setTimeout(() => endTurn(room), 2600);
    } else {
      pl.score = Math.max(0, pl.score - 30);
      pl.wrong++;
      io.to(room.code).emit('game:wrong', {
        playerId: socket.id, name: player.name,
        guess: String(name).slice(0, 40)
      });
    }
  });

  socket.on('disconnect', () => {
    removeFromRoom(socket);
    players.delete(socket.id);
  });
});

/* ============ إدارة الغرف ============ */
function removeFromRoom(socket) {
  const player = players.get(socket.id);
  if (!player?.room) return;
  const room = rooms.get(player.room);
  if (!room) return;

  room.players = room.players.filter(p => p.id !== socket.id);
  player.room = null;
  socket.leave(room.code);

  if (room.players.length === 0) {
    if (room.game?.timer) clearInterval(room.game.timer);
    rooms.delete(room.code);
  } else {
    if (room.hostId === socket.id) room.hostId = room.players[0].id;
    io.to(room.code).emit('room:update', serializeRoom(room));
    io.to(room.code).emit('chat:sys', { text: `${player.name} خرج من الغرفة` });
    if (room.game && room.game.turnPlayerId === socket.id) endTurn(room);
  }
}

/* ============ منطق اللعب ============ */
function startGame(room) {
  room.state = 'playing';
  const cards = {}, scores = {};
  room.players.forEach(p => {
    cards[p.id] = drawCard(room.options.categories);
    scores[p.id] = { score: 0, correct: 0, wrong: 0 };
  });
  room.game = {
    round: 1, turnIndex: 0,
    turnPlayerId: room.players[0].id,
    cards, scores, history: [],
    timeLeft: room.options.turnTime,
    timer: null, phase: 'playing'
  };
  io.to(room.code).emit('game:start', {
    players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar })),
    options: room.options, scores
  });
  setTimeout(() => startTurn(room), 1200);
}

function startTurn(room) {
  const g = room.game;
  if (!g) return;
  g.history = [];
  g.timeLeft = room.options.turnTime;
  g.phase = 'playing';

  room.players.forEach(p => {
    const ownCard = g.cards[p.id];
    const others = room.players
      .filter(x => x.id !== p.id)
      .map(x => ({
        playerId: x.id, name: x.name, avatar: x.avatar,
        card: g.cards[x.id]
      }));
    io.to(p.id).emit('game:turn', {
      turnPlayerId: g.turnPlayerId,
      yourCard: ownCard, others,
      scores: g.scores, round: g.round,
      rounds: room.options.rounds, timeLeft: g.timeLeft
    });
  });

  io.to(room.code).emit('game:turn-banner', {
    playerId: g.turnPlayerId,
    name: room.players.find(p => p.id === g.turnPlayerId)?.name || 'لاعب'
  });

  if (g.timer) clearInterval(g.timer);
  g.timer = setInterval(() => {
    if (!room.game || room.game.phase !== 'playing') return;
    g.timeLeft--;
    io.to(room.code).emit('game:tick', { timeLeft: g.timeLeft });
    if (g.timeLeft <= 0) {
      clearInterval(g.timer);
      g.phase = 'paused';
      const card = g.cards[g.turnPlayerId];
      const pl = g.scores[g.turnPlayerId];
      if (pl) pl.wrong++;
      io.to(room.code).emit('game:timeout', { playerId: g.turnPlayerId, card });
      setTimeout(() => endTurn(room), 2600);
    }
  }, 1000);
}

function endTurn(room) {
  const g = room.game;
  if (!g) return;
  if (g.timer) clearInterval(g.timer);

  g.turnIndex++;
  if (g.turnIndex >= room.players.length) {
    g.turnIndex = 0;
    g.round++;
    if (g.round > room.options.rounds) return endGame(room);
    io.to(room.code).emit('game:round', { round: g.round });
  }
  if (!room.players[g.turnIndex]) g.turnIndex = 0;
  if (!room.players[0]) return;

  g.turnPlayerId = room.players[g.turnIndex].id;
  room.players.forEach(p => { g.cards[p.id] = drawCard(room.options.categories); });
  setTimeout(() => startTurn(room), 1500);
}

function endGame(room) {
  if (room.game?.timer) clearInterval(room.game.timer);
  const arr = room.players.map(p => ({
    id: p.id, name: p.name, avatar: p.avatar,
    score: room.game.scores[p.id]?.score || 0,
    correct: room.game.scores[p.id]?.correct || 0
  })).sort((a, b) => b.score - a.score);
  io.to(room.code).emit('game:end', { players: arr });
  room.state = 'waiting';
  room.game = null;
}

/* ============ تشغيل ============ */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Headbanz server running on port ${PORT}`);
});
