---
phase: 05-ui-polish
plan: 02
subsystem: frontend-pages
tags: [tailwind, ui-polish, dark-mode, spinner, pages]
dependency_graph:
  requires: [05-01]
  provides: [polished-pages, spinner-component]
  affects: [all-9-inner-pages]
tech_stack:
  added: []
  patterns:
    - Spinner component with Tailwind animate-spin and size variants
    - bg-surface border border-border rounded-xl card pattern across all pages
    - fixed inset-0 bg-black/50 modal overlay pattern (Tasks, Notes, Goals, Snippets)
    - Data-driven inline style exception for heatmap colors, difficulty badges, and dynamic accentColor
key_files:
  created:
    - frontend/src/components/Spinner.js
  modified:
    - frontend/src/pages/DashboardPage.js
    - frontend/src/pages/TasksPage.js
    - frontend/src/pages/NotesPage.js
    - frontend/src/pages/GoalsPage.js
    - frontend/src/pages/SnippetsPage.js
    - frontend/src/pages/ApiTesterPage.js
    - frontend/src/pages/PomodoroPage.js
    - frontend/src/pages/DsaPage.js
    - frontend/src/pages/ProfilePage.js
decisions:
  - Snippets form moved from inline to modal overlay for consistency with Tasks/Notes/Goals
  - ProfilePage Section helper component removed (unused after Tailwind rewrite)
  - ContribHeatmap inline styles fully preserved — GitHub green color scale is data-driven, not stylable via tokens
  - Pomodoro accentColor kept as dynamic inline style for border, progress fill, and start button — computed at runtime from mode state
metrics:
  duration_minutes: 35
  completed_date: "2026-03-28"
  tasks_completed: 3
  files_modified: 10
---

# Phase 5 Plan 2: UI Polish — All Inner Pages Summary

**One-liner:** Tailwind CSS applied to all 9 inner pages with shared Spinner component, consistent card/modal patterns, and dark-mode-safe ProfilePage using CSS variable tokens.

## What Was Built

### Spinner Component
- `frontend/src/components/Spinner.js` — reusable animated spinner with `sm`/`md`/`lg` size variants using Tailwind `animate-spin border-border border-t-accent`.
- Imported in all 9 pages for loading states.

### Task 1 — Dashboard + Tasks
- **DashboardPage:** Replaced all inline styles. Stat cards use `bg-surface border border-border rounded-xl`. Streak banner uses `bg-slate-900 text-white`. Modal uses `fixed inset-0` overlay.
- **TasksPage:** Full Tailwind rewrite. Status badges (todo/in_progress/done) and priority badges (high/medium/low) use dynamic Tailwind class maps. Modal uses `fixed inset-0 bg-black/50` overlay with `bg-surface rounded-2xl` card. All logic preserved exactly.

### Task 2 — Notes, Goals, Snippets, ApiTester
- **NotesPage:** Cards with `bg-surface border border-border rounded-xl`. Modal overlay. Empty state with centered message.
- **GoalsPage:** Cards with dynamic border color (`border-green-300` when complete). Completion badge, delete button.
- **SnippetsPage:** Form moved from inline to modal overlay. Language badges preserve data-driven hex colors via inline style. Code blocks use `bg-bg font-mono` pre element.
- **ApiTesterPage:** Request builder in `bg-surface` card. Status badge class map for 2xx/4xx/5xx. History list with method badges and status pills. Spinner inline in send button during fetch.

### Task 3 — Pomodoro, DSA, Profile
- **PomodoroPage:** Tailwind for all layout/spacing. Dynamic `accentColor` kept as inline style for border, progress bar fill, and start button (runtime-computed from work/break mode).
- **DsaPage:** Progress card, accordion with Tailwind classes. Day number badge keeps data-driven `#10b981` vs `var(--border)` background. Difficulty badges preserve hex colors inline. Spinner for loading.
- **ProfilePage:** All hardcoded `#ffffff`, `#e2e8f0`, `#64748b` structural colors replaced with `bg-surface`, `border-border`, `text-text/60` tokens. ContribHeatmap entirely unchanged (GitHub green color scale). Disconnected state uses `bg-surface border border-border rounded-2xl`. `Section` helper removed (unused after rewrite).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Cleanup] Removed unused `Section` component from ProfilePage**
- **Found during:** Task 3 build verification
- **Issue:** `Section` helper component was defined in original ProfilePage but not used in the Tailwind rewrite (sections styled inline). ESLint `no-unused-vars` warning.
- **Fix:** Removed the `Section` function entirely.
- **Files modified:** `frontend/src/pages/ProfilePage.js`
- **Commit:** 50320bf

**2. [Rule 2 - Pattern] Snippets form moved to modal overlay**
- **Found during:** Task 2
- **Issue:** SnippetsPage used an inline expanded form card rather than a modal — inconsistent with Notes/Goals/Tasks pattern.
- **Fix:** Wrapped form in `fixed inset-0 bg-black/50` modal overlay to match the established pattern.
- **Files modified:** `frontend/src/pages/SnippetsPage.js`

## Self-Check: PASSED

All 10 files created/modified confirmed on disk.
Commits confirmed: bb90163, 001d549, 2f65ea8, 50320bf.
`npm run build` passes with no errors (warnings are pre-existing eslint hooks pattern, not introduced by this plan).
