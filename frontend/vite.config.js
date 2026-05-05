import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log(' VITE CONFIG LOADED');

export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
