import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { GameState, ServerMessage } from '@dojo-chess/shared';
import { ChessBoard } from '../components/ChessBoard.js';

// Derive WebSocket base from the current page host so the same build works
// in dev (Vite proxy on :5173) and production (nginx on :80 or :443).
const WS_BASE = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

const containerStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
};

export function GameViewer() {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connStatus, setConnStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let delay = 1000;

    function connect() {
      if (!mountedRef.current) return;
      setConnStatus('connecting');
      const ws = new WebSocket(`${WS_BASE}/games/${gameId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        setConnStatus('connected');
        delay = 1000; // reset backoff on successful connect
      };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data as string) as ServerMessage;
        if (msg.type === 'state') setGameState(msg.payload);
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnStatus('disconnected');
        // Reconnect with exponential backoff if game isn't finished
        reconnectRef.current = setTimeout(() => {
          delay = Math.min(delay * 2, 16000);
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [gameId]);

  const statusColor = connStatus === 'connected' ? '#2ecc71' : connStatus === 'connecting' ? '#f39c12' : '#e74c3c';

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 580 }}>
        <Link to="/" style={{ color: '#a8d8ea', fontSize: 13 }}>← Back to editor</Link>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#aaa' }}>
          Game <code style={{ color: '#e0e0e0' }}>{gameId}</code>
        </span>
        <span style={{ fontSize: 12, color: statusColor }}>● {connStatus}</span>
      </div>

      {gameState ? (
        <>
          <div style={{ fontSize: 13, color: '#aaa' }}>
            Phase: <strong style={{ color: '#fff' }}>{gameState.phase}</strong>
            {' · '}Moves: <strong style={{ color: '#fff' }}>{gameState.moveCount}</strong>
          </div>
          <ChessBoard state={gameState} />
        </>
      ) : (
        <div style={{ marginTop: 40, color: '#888' }}>Waiting for game state…</div>
      )}
    </div>
  );
}
