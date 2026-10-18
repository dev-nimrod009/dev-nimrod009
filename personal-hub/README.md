# Life Hub (personal-hub)

A private personal journal, planner, and wellbeing app. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Today** dashboard: day plan progress, upcoming reminders, habit check-offs, water tracker, and mood check-in
- **Writing**: Journal (searchable entries with mood tags), Diary (one page per day), Notepad (pinnable notes), Quote Vault
- **Planning**: Day Plans (per-day to-do lists), Reminders (with due dates and overdue flags), Goals (monthly/yearly with steps)
- **Wellbeing**: Habits (7-day tracker with streaks), Meal Planner (with weekly budget), Mood tracking, Water intake, Gratitude journal
- **Brain Dump**: capture stray thoughts and file them into the day plan or notepad later
- **Account**: email/password sign-in, optional biometric (passkey) unlock, profile details, and backup/restore to a JSON file
- **Offline-first**: entries are cached on-device and queued for sync when the connection returns
- Installable as a PWA on phones

## Getting started

1. Install dependencies: `npm install`
2. Create a Supabase project and run the SQL files in `supabase/migrations/` in filename order
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a `.env` file
4. Develop locally with `npm run dev`, or build with `npm run build`

## Project layout

- `src/pages/` — one component per screen
- `src/lib/data.ts` — offline-aware data access layer
- `src/lib/auth.tsx` — sign-in state and passkey support
- `supabase/migrations/` — database schema, in apply order
