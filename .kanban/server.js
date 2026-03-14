const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4444;
const BOARD_FILE = path.join(__dirname, 'board.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readBoard() {
  return JSON.parse(fs.readFileSync(BOARD_FILE, 'utf-8'));
}

function writeBoard(data) {
  data.meta.lastUpdated = new Date().toISOString().split('T')[0];
  fs.writeFileSync(BOARD_FILE, JSON.stringify(data, null, 2));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/board
app.get('/api/board', (req, res) => {
  res.json(readBoard());
});

// POST /api/board — full overwrite
app.post('/api/board', (req, res) => {
  writeBoard(req.body);
  res.json({ ok: true });
});

// POST /api/cards — add new card
app.post('/api/cards', (req, res) => {
  const board = readBoard();
  const card = {
    ...req.body,
    createdAt: new Date().toISOString().split('T')[0],
    movedAt: new Date().toISOString().split('T')[0],
    history: [{ from: null, to: req.body.column || 'backlog', at: new Date().toISOString().split('T')[0] }],
  };
  board.cards.push(card);
  writeBoard(board);
  res.status(201).json(card);
});

// PATCH /api/cards/:id — update a card
app.patch('/api/cards/:id', (req, res) => {
  const board = readBoard();
  const idx = board.cards.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Card not found' });

  const prev = board.cards[idx];
  const updated = { ...prev, ...req.body };

  // Track column moves in history
  if (req.body.column && req.body.column !== prev.column) {
    updated.movedAt = new Date().toISOString().split('T')[0];
    updated.history = [
      ...(prev.history || []),
      { from: prev.column, to: req.body.column, at: updated.movedAt },
    ];
  }

  board.cards[idx] = updated;
  writeBoard(board);
  res.json(updated);
});

// DELETE /api/cards/:id
app.delete('/api/cards/:id', (req, res) => {
  const board = readBoard();
  const idx = board.cards.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Card not found' });
  board.cards.splice(idx, 1);
  writeBoard(board);
  res.json({ ok: true });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const board = readBoard();
  const total = board.cards.length;
  const byColumn = {};
  board.columns.forEach(col => { byColumn[col.id] = 0; });
  board.cards.forEach(c => { if (byColumn[c.column] !== undefined) byColumn[c.column]++; });
  const done = byColumn['done'] || 0;
  res.json({
    total,
    byColumn,
    inProgress: byColumn['in-progress'] || 0,
    done,
    completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Kanban board running at http://localhost:${PORT}\n`);
});
