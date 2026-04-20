# Mise Checklists — Phase 3 Location Access Patch

## Files to replace in your project

Copy these files into your existing mise-checklists folder, replacing the existing versions:

  src/lib/auth.ts
  src/components/ManageAccessTab.tsx

## SQL to run in Supabase

Run `phase3_schema.sql` in full in Supabase SQL Editor.

If you already ran a previous version of phase3_schema.sql, this version is
safe to re-run — all functions use CREATE OR REPLACE, and the table creation
uses IF NOT EXISTS.

The key addition is the `locations text[]` column on `admin_accounts` and the
updated `verify_admin_pin()` and `get_admin_accounts()` functions that return
it alongside name and role.

## No other files changed

The rest of the Phase 3 code (AdminLoginPage, AdminSetupPage, AdminPage,
App.tsx) is unchanged from the previous delivery.

## What this adds

- Each admin account now has an optional locations array
- Owners always see all locations (locations field is ignored for owners)
- Admins with an empty/null locations array also see all locations
- Admins with specific locations set only see logs, results, and issues
  for those locations in the admin panel
- Manage Access tab now shows each admin's location access and has a
  "Locations" button to edit it
- When adding a new admin, location access is set at creation time

## Location filtering

Filtering is applied in the admin panel at the data level — the admin
only sees submissions and issues for their assigned locations. The checklist
submission flow for staff is completely unaffected.
