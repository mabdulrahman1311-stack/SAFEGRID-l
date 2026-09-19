import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA offline caching & instant installability
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('SAFEGRID PWA: New content available.');
    },
    onOfflineReady() {
      console.log('SAFEGRID PWA: App ready to work offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
