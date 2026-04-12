/**
 * main.tsx — application entry point for Mise Checklists.
 *
 * Mounts the React application to the #root element defined in index.html.
 * StrictMode is enabled in development to surface potential issues early —
 * it has no effect on the production build.
 *
 * @author Joshua Bosen
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[Mise] Could not find #root element. Check that index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
