import type { GameState, Piece } from '@dojo-chess/shared';

const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
  'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
  'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
  'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟',
};

const SQ = 70; // square size in px
const BOARD_PX = SQ * 8;
const LIGHT = '#f0d9b5';
const DARK = '#b58863';
const COOLDOWN_COLOR = 'rgba(231, 76, 60, 0.7)';

interface Props {
  state: GameState;
}

function CooldownBar({ piece, serverTime }: { piece: Piece; serverTime: number }) {
  const remaining = Math.max(0, piece.cooldownUntil - serverTime);
  const fraction = remaining / 3000; // COOLDOWN_MS
  if (fraction <= 0) return null;
  return (
    <rect
      x={0}
      y={SQ - 6}
      width={SQ * fraction}
      height={6}
      fill={COOLDOWN_COLOR}
    />
  );
}

export function ChessBoard({ state }: Props) {
  const { board, serverTime, phase, winner } = state;

  return (
    <div>
      <svg
        width={BOARD_PX}
        height={BOARD_PX}
        style={{ display: 'block', border: '2px solid #444', borderRadius: 4 }}
      >
        {board.map((row: (import('@dojo-chess/shared').Piece | null)[], r: number) =>
          row.map((piece: import('@dojo-chess/shared').Piece | null, c: number) => {
            const x = c * SQ;
            const y = r * SQ;
            const isLight = (r + c) % 2 === 0;
            const onCooldown = piece ? piece.cooldownUntil > serverTime : false;
            const symbol = piece ? PIECE_SYMBOLS[`${piece.color}-${piece.type}`] : null;

            return (
              <g key={`${r}-${c}`} transform={`translate(${x},${y})`}>
                <rect width={SQ} height={SQ} fill={isLight ? LIGHT : DARK} />
                {piece && symbol && (
                  <>
                    <text
                      x={SQ / 2}
                      y={SQ / 2 + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={SQ * 0.62}
                      opacity={onCooldown ? 0.35 : 1}
                      style={{ userSelect: 'none' }}
                    >
                      {symbol}
                    </text>
                    <CooldownBar piece={piece} serverTime={serverTime} />
                  </>
                )}
                {/* Rank/file labels on border squares */}
                {c === 0 && (
                  <text x={3} y={14} fontSize={11} fill={isLight ? DARK : LIGHT} style={{ userSelect: 'none' }}>
                    {8 - r}
                  </text>
                )}
                {r === 7 && (
                  <text x={SQ - 10} y={SQ - 3} fontSize={11} fill={isLight ? DARK : LIGHT} style={{ userSelect: 'none' }}>
                    {String.fromCharCode('a'.charCodeAt(0) + c)}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      {phase === 'finished' && (
        <div style={{
          marginTop: 16, padding: '12px 24px', background: '#e94560',
          borderRadius: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold',
        }}>
          {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!` : 'Draw'}
        </div>
      )}
    </div>
  );
}
