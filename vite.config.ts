/**
 * Vite configuration for Mise Checklists.
 *
 * Environment variables prefixed with VITE_ are embedded into the client
 * bundle at build time by Vite. This is intentional for the Supabase anon key,
 * which is designed to be public — all data security is enforced by RLS on
 * the database, not by hiding the key.
 *
 * Never prefix a truly secret value (e.g. a service-role key or Stripe secret)
 * with VITE_ — it will be visible in the compiled bundle.
 *
 * @author Joshua Bosen
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Source maps expose your original source code to anyone with DevTools.
    // Disable in production. Enable locally by running: VITE_SOURCEMAP=true npm run build
    sourcemap: false,
  },
});
