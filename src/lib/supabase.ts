/**
 * Supabase client for Mise Checklists.
 * @author Joshua Bosen
 */
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Mise] Missing Supabase environment variables. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ORG_ID.');
  const showError = () => {
    const el = document.getElementById('root');
    if (!el) return;
    el.innerHTML = `<div style="min-height:100vh;background:#181530;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:system-ui,sans-serif"><div style="background:#1D1A38;border-radius:1.25rem;padding:2rem 1.75rem;max-width:420px;width:100%;box-shadow:6px 6px 14px rgba(0,0,0,.6)"><div style="font-size:1.1rem;font-weight:600;color:#E8297A;margin-bottom:.75rem">⚙️ Missing environment variables</div><p style="font-size:.85rem;color:#C8C0E8;margin-bottom:1.25rem;line-height:1.6">Create a <code style="background:#141228;padding:.1rem .4rem;border-radius:4px">.env.local</code> file in the project root:</p><pre style="background:#141228;border-radius:.75rem;padding:1rem;font-size:.78rem;color:#0DD8C4;overflow-x:auto">VITE_SUPABASE_URL=https://your-project.supabase.co&#10;VITE_SUPABASE_ANON_KEY=your-anon-key&#10;VITE_ORG_ID=your-org-uuid</pre><p style="font-size:.78rem;color:#4A4468;margin-top:1rem">Then restart: <code style="background:#141228;padding:.1rem .4rem;border-radius:4px">npm run dev</code></p></div></div>`;
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', showError) : showError();
}
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: { autoRefreshToken: false, persistSession: false },
});
