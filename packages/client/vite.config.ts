import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/bots': 'http://localhost:3001',
      '/games': {
        target: 'http://localhost:3001',
        ws: true,  // proxy WebSocket upgrades through Vite in dev
      },
    },
  },
});
