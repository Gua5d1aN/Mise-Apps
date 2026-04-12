/**
 * Vite client type declarations.
 *
 * This reference gives TypeScript full knowledge of Vite-specific globals,
 * including import.meta.env and import.meta.hot. Without it, TypeScript
 * reports that `env` does not exist on `ImportMeta`.
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
 * @author Joshua Bosen
 */

/// <reference types="vite/client" />

/**
 * Type declarations for the environment variables used by this app.
 *
 * All VITE_* variables are embedded into the client bundle at build time.
 * Adding them here gives autocomplete and type-safety when accessing them
 * via import.meta.env throughout the codebase.
 */
interface ImportMetaEnv {
  /** Supabase project URL. Safe to expose — enforced by RLS. */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon/publishable key. Safe to expose — enforced by RLS. */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /**
   * Phase 1 admin password. Embedded in the bundle — not truly secret.
   * Replaced by Supabase Auth in Phase 3.
   */
  readonly VITE_ADMIN_PW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
