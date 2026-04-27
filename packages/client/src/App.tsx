import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BotEditor } from './pages/BotEditor.js';
import { GameViewer } from './pages/GameViewer.js';

const navStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: '#16213e',
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

export function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <strong style={{ marginRight: 12 }}>♟ Dojo Chess</strong>
        <Link to="/" style={{ color: '#a8d8ea' }}>Bot Editor</Link>
      </nav>
      <Routes>
        <Route path="/" element={<BotEditor />} />
        <Route path="/games/:gameId" element={<GameViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
