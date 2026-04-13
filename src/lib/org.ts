/**
 * Organisation context for Mise Checklists.
 *
 * In Phase 2, the current organisation is identified by a UUID stored in the
 * VITE_ORG_ID environment variable. This value is set at build time by Vite
 * and corresponds to the `id` column of the organisations table in Supabase.
 *
 * Every database query uses ORG_ID to filter rows, ensuring a venue only ever
 * reads and writes its own data — even before Phase 3 auth is in place.
 *
 * Phase 3 replaces this module:
 *   - ORG_ID will be read from the authenticated user's org_members record
 *   - RLS policies will enforce it at the database level as a second layer
 *   - This file will export getOrgId() that returns the session org, not an
 *     env var constant
 *
 * @author Joshua Bosen
 */

const rawOrgId = import.meta.env.VITE_ORG_ID as string | undefined;

if (!rawOrgId) {
  console.error(
    '[Mise] VITE_ORG_ID is not set.\n\n' +
    'Run the Phase 2 SQL migration in Supabase, then copy the UUID it prints\n' +
    'into .env.local as:\n\n' +
    '  VITE_ORG_ID=your-org-uuid-here\n\n' +
    'And add the same value to Vercel Environment Variables.',
  );
}

/**
 * The UUID of the current organisation.
 *
 * Included in every database query as an explicit org_id filter.
 * Defaults to empty string if not configured — all queries will return
 * no rows rather than crashing, making misconfiguration easy to spot.
 */
export const ORG_ID: string = rawOrgId ?? '';
