-- ─────────────────────────────────────────────────────────────────────────────
-- Mise Checklists — Phase 2: Multi-Tenant Schema Migration
--
-- Run this entire file in Supabase SQL Editor in one go.
-- Safe to run on a live database — existing data is preserved and migrated.
--
-- After running, copy the UUID printed by the SELECT at the bottom into
-- your .env.local as VITE_ORG_ID, and into Vercel's environment variables.
--
-- Author: Joshua Bosen
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Step 1: Core organisation table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organisations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,       -- URL-safe identifier, e.g. '1hotel-melbourne'
  plan        text NOT NULL DEFAULT 'starter', -- starter | pro | studio | enterprise
  created_at  timestamptz DEFAULT now()
);


-- ── Step 2: Org members table (ready for Phase 3 auth) ───────────────────────
-- Links Supabase Auth users to organisations with a role.
-- Not actively used until Phase 3 implements magic link auth.

CREATE TABLE IF NOT EXISTS org_members (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_id      uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('staff', 'admin', 'owner')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (org_id, user_id)
);


-- ── Step 3: Insert 1 Hotel Melbourne as the first organisation ────────────────

INSERT INTO organisations (name, slug, plan)
VALUES ('1 Hotel Melbourne', '1hotel-melbourne', 'pro')
ON CONFLICT (slug) DO NOTHING; -- Safe to re-run


-- ── Step 4: Add org_id columns to existing tables ────────────────────────────
-- Added as nullable first so existing rows don't violate NOT NULL.
-- Made NOT NULL after data migration in Step 5.

ALTER TABLE checklist_logs
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(id);

ALTER TABLE checklist_config
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(id);

-- Add unique constraint on org_id so we can upsert config per-org
-- (replaces the old hardcoded id=1 approach)
ALTER TABLE checklist_config
  DROP CONSTRAINT IF EXISTS checklist_config_org_id_unique;
ALTER TABLE checklist_config
  ADD CONSTRAINT checklist_config_org_id_unique UNIQUE (org_id);

ALTER TABLE issue_logs
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organisations(id);


-- ── Step 5: Migrate existing data to 1 Hotel Melbourne org ───────────────────

UPDATE checklist_logs
SET org_id = (SELECT id FROM organisations WHERE slug = '1hotel-melbourne')
WHERE org_id IS NULL;

UPDATE checklist_config
SET org_id = (SELECT id FROM organisations WHERE slug = '1hotel-melbourne')
WHERE org_id IS NULL;

UPDATE issue_logs
SET org_id = (SELECT id FROM organisations WHERE slug = '1hotel-melbourne')
WHERE org_id IS NULL;


-- ── Step 6: Make org_id NOT NULL now that all rows are migrated ───────────────

ALTER TABLE checklist_logs
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE checklist_config
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE issue_logs
  ALTER COLUMN org_id SET NOT NULL;


-- ── Step 7: Enable Row Level Security on all tables ───────────────────────────

ALTER TABLE organisations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_logs       ENABLE ROW LEVEL SECURITY;


-- ── Step 8: Phase 2 RLS policies (permissive — tightened in Phase 3) ─────────
--
-- ⚠️  PHASE 2 ONLY: These policies allow the anon key to access all rows.
-- This maintains backward compatibility while the schema is multi-tenant ready.
--
-- Phase 3 will DROP these policies and replace them with auth-scoped ones:
--   USING (org_id = get_my_org_id())
-- where get_my_org_id() reads from org_members for the authenticated user.
--
-- Until Phase 3, security relies on:
--   1. The app filtering all queries by org_id from the env var
--   2. The admin password gate preventing unauthorised access to admin features
--   3. The Supabase anon key being kept out of version control

-- checklist_logs
DROP POLICY IF EXISTS "phase2_anon_select_checklist_logs" ON checklist_logs;
DROP POLICY IF EXISTS "phase2_anon_insert_checklist_logs" ON checklist_logs;
DROP POLICY IF EXISTS "phase2_anon_delete_checklist_logs" ON checklist_logs;

CREATE POLICY "phase2_anon_select_checklist_logs"
  ON checklist_logs FOR SELECT TO anon USING (true);

CREATE POLICY "phase2_anon_insert_checklist_logs"
  ON checklist_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "phase2_anon_delete_checklist_logs"
  ON checklist_logs FOR DELETE TO anon USING (true);

-- checklist_config
DROP POLICY IF EXISTS "phase2_anon_select_checklist_config" ON checklist_config;
DROP POLICY IF EXISTS "phase2_anon_insert_checklist_config" ON checklist_config;
DROP POLICY IF EXISTS "phase2_anon_update_checklist_config" ON checklist_config;

CREATE POLICY "phase2_anon_select_checklist_config"
  ON checklist_config FOR SELECT TO anon USING (true);

CREATE POLICY "phase2_anon_insert_checklist_config"
  ON checklist_config FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "phase2_anon_update_checklist_config"
  ON checklist_config FOR UPDATE TO anon USING (true);

-- issue_logs
DROP POLICY IF EXISTS "phase2_anon_select_issue_logs" ON issue_logs;
DROP POLICY IF EXISTS "phase2_anon_insert_issue_logs" ON issue_logs;
DROP POLICY IF EXISTS "phase2_anon_update_issue_logs" ON issue_logs;

CREATE POLICY "phase2_anon_select_issue_logs"
  ON issue_logs FOR SELECT TO anon USING (true);

CREATE POLICY "phase2_anon_insert_issue_logs"
  ON issue_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "phase2_anon_update_issue_logs"
  ON issue_logs FOR UPDATE TO anon USING (true);

-- organisations (read-only for anon — no venue should be able to modify others)
DROP POLICY IF EXISTS "phase2_anon_select_organisations" ON organisations;

CREATE POLICY "phase2_anon_select_organisations"
  ON organisations FOR SELECT TO anon USING (true);


-- ── Step 9: Helper function (foundation for Phase 3) ─────────────────────────
--
-- get_my_org_id() will be used by Phase 3 RLS policies to automatically scope
-- every query to the authenticated user's organisation.
-- Currently returns NULL (no auth yet) — Phase 3 activates it.

CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT org_id
  FROM org_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;


-- ── Final: Print the org UUID ─────────────────────────────────────────────────
-- Copy this UUID into your .env.local as VITE_ORG_ID
-- and into Vercel's Environment Variables panel.

SELECT
  id AS "VITE_ORG_ID — copy this value",
  name,
  slug,
  plan
FROM organisations
WHERE slug = '1hotel-melbourne';
