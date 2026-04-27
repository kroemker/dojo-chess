import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { saveBotApi, listBotsApi, startGameApi } from '../api.js';
import type { BotRecord } from '@dojo-chess/shared';

const DEFAULT_CODE = `/**
 * Called every game tick for each of your pieces that can move.
 *
 * @param {object} gameState
 *   - board: 8x8 array (row 0 = black back rank, row 7 = white back rank)
 *   - myColor: 'white' | 'black'
 *   - serverTime: current server time (ms) for cooldown comparisons
 *
 * getPossibleMoves(gameState, { row, col }) returns all legal moves
 * for the piece at that square as [{ from, to }, ...].
 *
 * Return a move object { from: { row, col }, to: { row, col } } or null.
 */
function makeMove(gameState) {
  const { board, myColor, serverTime } = gameState;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === myColor && piece.cooldownUntil <= serverTime) {
        const moves = getPossibleMoves(gameState, { row, col });
        if (moves.length > 0) {
          return moves[Math.floor(Math.random() * moves.length)];
        }
      }
    }
  }
  return null;
}
`;

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: 900,
  margin: '0 auto',
};

const rowStyle: React.CSSProperties = {
  display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', fontSize: 14, borderRadius: 6,
  border: '1px solid #444', background: '#0f3460', color: '#eee', flex: 1,
};

const btnStyle: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 6, border: 'none',
  background: '#e94560', color: '#fff', cursor: 'pointer', fontSize: 14,
};

const botListStyle: React.CSSProperties = {
  marginTop: 24,
};

const botItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '8px 12px', background: '#16213e', borderRadius: 6, marginBottom: 8,
};

export function BotEditor() {
  const [name, setName] = useState('my-bot');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState('');
  const [bots, setBots] = useState<Omit<BotRecord, 'code'>[]>([]);
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadBots(); }, []);

  async function loadBots() {
    try { setBots(await listBotsApi()); } catch { /* ignore */ }
  }

  async function handleSave() {
    setStatus('Saving…');
    try {
      await saveBotApi(name, code);
      setStatus('Saved!');
      await loadBots();
    } catch (e) {
      setStatus(`Error: ${String(e)}`);
    }
  }

  async function handleStart() {
    const wid = parseInt(whiteId, 10);
    const bid = parseInt(blackId, 10);
    if (!wid || !bid) { setStatus('Select both bots first'); return; }
    setStatus('Starting game…');
    try {
      const { gameId } = await startGameApi(wid, bid);
      navigate(`/games/${gameId}`);
    } catch (e) {
      setStatus(`Error: ${String(e)}`);
    }
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginTop: 0 }}>Bot Editor</h2>
      <div style={rowStyle}>
        <input
          style={inputStyle}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Bot name"
        />
        <button style={btnStyle} onClick={handleSave}>Save Bot</button>
        {status && <span style={{ color: '#aaa', fontSize: 13 }}>{status}</span>}
      </div>

      <Editor
        height="420px"
        defaultLanguage="javascript"
        value={code}
        onChange={v => setCode(v ?? '')}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
      />

      {bots.length > 0 && (
        <div style={botListStyle}>
          <h3>Saved Bots</h3>
          {bots.map(b => (
            <div key={b.id} style={botItemStyle}>
              <span style={{ flex: 1 }}>{b.name} <span style={{ color: '#888', fontSize: 12 }}>#{b.id}</span></span>
            </div>
          ))}

          <h3>Start a Game</h3>
          <div style={rowStyle}>
            <select style={inputStyle} value={whiteId} onChange={e => setWhiteId(e.target.value)}>
              <option value="">White bot…</option>
              {bots.map(b => <option key={b.id} value={b.id}>{b.name} #{b.id}</option>)}
            </select>
            <select style={inputStyle} value={blackId} onChange={e => setBlackId(e.target.value)}>
              <option value="">Black bot…</option>
              {bots.map(b => <option key={b.id} value={b.id}>{b.name} #{b.id}</option>)}
            </select>
            <button style={btnStyle} onClick={handleStart}>▶ Play</button>
          </div>
        </div>
      )}
    </div>
  );
}
