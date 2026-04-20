/**
 * Organisation context for Mise Checklists — Phase 2.
 * @author Joshua Bosen
 */
const rawOrgId = import.meta.env.VITE_ORG_ID as string | undefined;
if (!rawOrgId) console.error('[Mise] VITE_ORG_ID is not set. Run Phase 2 SQL migration and add VITE_ORG_ID to .env.local');
export const ORG_ID: string = rawOrgId ?? '';
