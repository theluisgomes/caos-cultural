import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './src/App';
import { initializeFirebaseProducts } from './src/lib/initFirebase';
import { reportError } from './src/lib/observability';

window.addEventListener('error', event => reportError(event.error, { source: 'window.onerror' }));
window.addEventListener('unhandledrejection', event => reportError(event.reason, { source: 'unhandledrejection' }));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

async function bootstrap() {
  await initializeFirebaseProducts();
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void bootstrap();
