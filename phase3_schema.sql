-- ─────────────────────────────────────────────────────────────────────────────
-- Mise Checklists — Phase 3: PIN-Based Admin Auth + Location Access Control
--
-- Run this entire file in Supabase SQL Editor in one go.
-- Safe to run on a live database — does not affect checklist or issue data.
--
-- Author: Joshua Bosen
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Step 1: Admin accounts table ─────────────────────────────────────────────
--
-- locations: text[] of location names this admin can access.
--   NULL or empty = all locations (owner default behaviour).
--   e.g. ARRAY['Kitchen', 'Bar'] restricts to those two locations only.
--
-- Owners always see all locations regardless of the locations column.
-- The app enforces this — owners bypass the location filter entirely.

CREATE TABLE IF NOT EXISTS admin_accounts (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_id      uuid NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  pin_hash    text NOT NULL,
  role        text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
  locations   text[],          -- NULL = all locations; populated array = restricted
  created_at  timestamptz DEFAULT now(),
  UNIQUE (org_id, name)
);


-- ── Step 2: RLS on admin_accounts ────────────────────────────────────────────

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "no_direct_anon_read_admin_accounts" ON admin_accounts;
CREATE POLICY "no_direct_anon_read_admin_accounts"
  ON admin_accounts FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS "anon_insert_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_insert_admin_accounts"
  ON admin_accounts FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_delete_admin_accounts"
  ON admin_accounts FOR DELETE TO anon USING (true);

DROP POLICY IF EXISTS "anon_update_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_update_admin_accounts"
  ON admin_accounts FOR UPDATE TO anon USING (true);


-- ── Step 3: PIN verification — returns locations alongside name + role ────────
--
-- Returns admin_locations so the app can store it in the session and apply
-- location-based filtering throughout the admin panel.

CREATE OR REPLACE FUNCTION verify_admin_pin(
  p_org_id   uuid,
  p_pin_hash text
)
RETURNS TABLE (admin_name text, admin_role text, admin_locations text[])
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    name      AS admin_name,
    role      AS admin_role,
    locations AS admin_locations
  FROM   admin_accounts
  WHERE  org_id   = p_org_id
  AND    pin_hash = p_pin_hash
  LIMIT  1;
$$;

GRANT EXECUTE ON FUNCTION verify_admin_pin(uuid, text) TO anon;


-- ── Step 4: Admin name listing ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_names(p_org_id uuid)
RETURNS TABLE (admin_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT name AS admin_name
  FROM   admin_accounts
  WHERE  org_id = p_org_id
  ORDER  BY name ASC;
$$;

GRANT EXECUTE ON FUNCTION get_admin_names(uuid) TO anon;


-- ── Step 5: Full account listing (for Manage Access tab) ─────────────────────
-- Includes locations — never includes pin_hash.

CREATE OR REPLACE FUNCTION get_admin_accounts(p_org_id uuid)
RETURNS TABLE (
  id          bigint,
  admin_name  text,
  admin_role  text,
  locations   text[],
  created_at  timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    id,
    name      AS admin_name,
    role      AS admin_role,
    locations,
    created_at
  FROM   admin_accounts
  WHERE  org_id = p_org_id
  ORDER  BY created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION get_admin_accounts(uuid) TO anon;


-- ── Verify: confirm everything installed correctly ────────────────────────────

SELECT 'admin_accounts table' AS item,
       'ready — 0 accounts' AS status
WHERE NOT EXISTS (
  SELECT 1 FROM admin_accounts
  WHERE org_id = (SELECT id FROM organisations WHERE slug = '1hotel-melbourne')
)

UNION ALL

SELECT 'verify_admin_pin', 'installed'
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'verify_admin_pin')

UNION ALL

SELECT 'get_admin_names', 'installed'
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_names')

UNION ALL

SELECT 'get_admin_accounts', 'installed'
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_accounts');
