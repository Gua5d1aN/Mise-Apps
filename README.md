# Mise Checklists

Hospitality operations platform — section checklists and maintenance logs.

**Author:** Joshua Bosen  
**Property:** 1 Hotel Melbourne  
**Stack:** React · TypeScript · Vite · Supabase · Vercel  
**Phase:** 1 — Build Toolchain  

---

## Features

### Staff-facing
- **Welcome screen** — Daily Checklists, Maintenance Logs, and coming-soon Staff Training
- **Section Checklists** — Opening, Closing, Overnight, Weekly, Bi-Weekly, Monthly shifts
- **Photo tasks** — required photo uploads with optional admin-set example reference photos
- **Maintenance Logs** — log equipment issues with name, item description, and photo
- **PWA** — installable on iOS and Android home screens

### Admin panel (4 tabs)
- **Submission Log** — grouped by date and location, tap to expand task detail
- **Results** — completion rates, per-section breakdowns, most-missed tasks
- **Issue Log** — maintenance reports grouped by date, inline photo viewing
- **Edit Checklists** — live-saving task editor, dynamic sections (add/remove), per-shift enable/disable, example photo upload per task

---

## Project Structure

```
mise-checklists/
├── public/
│   ├── sw.js              ← Service worker (Phase 1: minimal)
│   ├── manifest.json      ← PWA manifest
│   ├── icon-192.png       ← Add your app icon here
│   └── icon-512.png       ← Add your app icon here
├── src/
│   ├── components/
│   │   ├── ui/            ← Primitive components
│   │   │   ├── index.ts
│   │   │   ├── Wordmark.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── Frame.tsx
│   │   │   ├── ColFrame.tsx
│   │   │   ├── Pill.tsx
│   │   │   ├── TabBtn.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── ActionBtn.tsx
│   │   │   ├── BtnPink.tsx
│   │   │   ├── BtnAmber.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── Lbl.tsx
│   │   │   ├── SecLbl.tsx
│   │   │   ├── DateHdr.tsx
│   │   │   ├── CheckTick.tsx
│   │   │   ├── CheckBig.tsx
│   │   │   └── Lightbox.tsx
│   │   ├── TaskRow.tsx     ← Task item + photo upload + example lightbox
│   │   ├── EditTaskRow.tsx ← Admin task editor + example photo upload
│   │   └── ResultsView.tsx ← Analytics dashboard
│   ├── constants/
│   │   ├── index.ts        ← STRUCTURE, LOCS, SHIFTS, DEFAULT_ENABLED, ADMIN_PW
│   │   └── defaultTasks.ts ← Seed tasks for all sections (all 6 shifts)
│   ├── lib/
│   │   ├── supabase.ts     ← Client init (reads from env vars)
│   │   ├── api.ts          ← All DB operations (checklists + issues)
│   │   ├── storage.ts      ← Photo upload (tasks, examples, issues)
│   │   ├── csv.ts          ← CSV export
│   │   └── utils.ts        ← deepClone, migrateConfig, groupLogsByDate, groupIssuesByDate
│   ├── pages/
│   │   ├── WelcomePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ChecklistPage.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── IssueLogPage.tsx
│   │   ├── IssueSuccessPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   └── AdminPage.tsx
│   ├── styles/
│   │   ├── tokens.ts       ← C (colours) and SH (shadows) design tokens
│   │   └── index.ts        ← Legacy CSSProperties tokens (kept for reference)
│   ├── types/
│   │   └── index.ts        ← All TypeScript interfaces
│   ├── App.tsx             ← Root component — all state and handlers
│   ├── main.tsx            ← Entry point
│   └── vite-env.d.ts       ← Vite/env type declarations
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PW=change-me-before-deploying
```

### 3. Run locally
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Build for production
```bash
npm run build
# Output in dist/
```

---

## Supabase Setup

### Tables required

```sql
-- Checklist configuration (single row per org in Phase 2)
CREATE TABLE checklist_config (
  id         integer PRIMARY KEY,
  config     jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Checklist submission logs
CREATE TABLE checklist_logs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name       text NOT NULL,
  location   text NOT NULL,
  section    text NOT NULL,
  shift      text NOT NULL,
  completed  integer NOT NULL,
  total      integer NOT NULL,
  tasks      jsonb NOT NULL DEFAULT '[]'
);

-- Maintenance issue logs
CREATE TABLE issue_logs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name       text NOT NULL,
  item_name  text NOT NULL,
  photo_url  text
);
```

### Storage bucket
Create a **public** storage bucket named `checklist-photos` in Supabase Storage.

### Icons
Add `icon-192.png` and `icon-512.png` to the `public/` folder for PWA install icons.

---

## Deployment (Vercel)

1. Push repo to GitHub (`.env.local` is gitignored)
2. Connect repo to a new Vercel project
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PW`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy — every push to `main` auto-deploys

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| **1** | Build toolchain — Vite, TypeScript, Vercel | ✅ Complete |
| 2 | Multi-tenant schema — organisations, RLS | Upcoming |
| 3 | Real auth — Supabase magic link replacing admin password | Upcoming |
| 4 | Product rebuild — PWA offline, venue config panel | Upcoming |
| 5 | Billing — Stripe | Upcoming |
| 6–10 | Onboarding, domains, marketing, launch | Upcoming |

---

## Security Notes

- The Supabase anon key is intentionally in the client bundle — all data access is controlled by RLS on the database.
- `VITE_ADMIN_PW` is embedded in the compiled bundle by Vite. It is **not truly secret**. **Phase 3 replaces the admin password gate entirely with Supabase Auth.**
- Never commit `.env.local` to git.

---

*Built by Joshua Bosen · 1 Hotel Melbourne*
