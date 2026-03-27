---
phase: 05-ui-polish
plan: 03
subsystem: ui
tags: [framer-motion, react, animations, page-transitions, svg, accordion]

# Dependency graph
requires:
  - phase: 05-ui-polish/05-01
    provides: framer-motion installed, Tailwind configured
  - phase: 05-ui-polish/05-02
    provides: all pages restyled with Tailwind, modal overlays, Spinner component

provides:
  - AnimatePresence-wrapped page transitions on every route change
  - Scale+fade modal animations on TasksPage and SnippetsPage
  - Staggered card entrance animations on DashboardPage stat cards and TasksPage task list
  - DSA accordion animated height expand/collapse
  - Pomodoro animated SVG circular ring with stroke-dashoffset fill
  - Page-level motion.div wrappers on all 9 inner pages

affects: [05-ui-polish checkpoint, DevOps phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pageVariants object (initial/animate/exit) reused across all inner page components
    - AnimatePresence mode="wait" with location.pathname key for React Router v6 transitions
    - listVariants + itemVariants stagger pattern for card grids and lists
    - AnimatePresence initial={false} for accordion to skip mount animation
    - SVG circle with strokeDasharray + strokeDashoffset + CSS transition for progress ring

key-files:
  created: []
  modified:
    - frontend/src/App.js
    - frontend/src/pages/DashboardPage.js
    - frontend/src/pages/TasksPage.js
    - frontend/src/pages/SnippetsPage.js
    - frontend/src/pages/NotesPage.js
    - frontend/src/pages/GoalsPage.js
    - frontend/src/pages/ApiTesterPage.js
    - frontend/src/pages/ProfilePage.js
    - frontend/src/pages/PomodoroPage.js
    - frontend/src/pages/DsaPage.js

key-decisions:
  - "AnimatedRoutes component extracted from App.js to allow useLocation inside BrowserRouter context"
  - "AnimatePresence mode='wait' with key={location.pathname} — pathname key (not location.key) avoids issues with trailing slashes"
  - "ProfilePage has 3 return paths (loading, not-connected, connected) — all wrapped in motion.div separately"
  - "Pomodoro SVG ring uses CSS transition instead of motion.circle — simpler and avoids framer-motion SVG quirks"
  - "AnimatePresence initial={false} on DSA accordion prevents height animation on first render"

patterns-established:
  - "pageVariants: {initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.25}}, exit:{opacity:0,y:-8,transition:{duration:0.15}}}"
  - "Modal pattern: AnimatePresence > motion.div overlay (opacity only) > motion.div card (scale+opacity)"
  - "Stagger pattern: parent motion.div with listVariants animate.staggerChildren, children with itemVariants"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-03-28
---

# Phase 5 Plan 3: Framer Motion Animations Summary

**Framer Motion page transitions, animated modals, staggered card lists, DSA accordion height animation, and Pomodoro SVG ring wired across all 9 inner pages**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-27T18:47:34Z
- **Completed:** 2026-03-27T18:53:38Z
- **Tasks:** 3/3 (human-verify checkpoint approved — user confirmed animations polished under Midnight Indigo theme)
- **Files modified:** 10

## Accomplishments
- App.js refactored to extract AnimatedRoutes with AnimatePresence + useLocation for smooth page transitions on every route change
- All 9 inner pages wrapped with motion.div using shared pageVariants (fade + 16px slide up on enter, fade + slide up on exit)
- TasksPage and SnippetsPage modals now animate scale+fade in/out via AnimatePresence
- DashboardPage stat cards and TasksPage task cards stagger in with 60ms delay per item
- DsaPage accordion animates height 0 to auto smoothly on expand/collapse with AnimatePresence
- PomodoroPage flat progress bar replaced with animated SVG circular ring using stroke-dashoffset

## Task Commits

Each task was committed atomically:

1. **Task 1: Page transitions, modal animations, staggered card lists** - `6e10900` (feat)
2. **Task 2: DSA accordion animation + Pomodoro SVG ring** - `412542e` (feat)
3. **Task 3: Human verify checkpoint** - approved (user confirmed animations polished, theme updated to Midnight Indigo)

**Post-approval extras:**
- `381665a` — Midnight Indigo theme applied (bg #0f0f23, surface #1a1a3e, white accent) based on user feedback

## Files Created/Modified
- `frontend/src/App.js` - Extracted AnimatedRoutes with AnimatePresence + useLocation
- `frontend/src/pages/DashboardPage.js` - pageVariants wrapper, staggered stat cards, modal animation
- `frontend/src/pages/TasksPage.js` - pageVariants wrapper, staggered task list, modal animation
- `frontend/src/pages/SnippetsPage.js` - pageVariants wrapper, modal animation with AnimatePresence
- `frontend/src/pages/NotesPage.js` - pageVariants wrapper
- `frontend/src/pages/GoalsPage.js` - pageVariants wrapper
- `frontend/src/pages/ApiTesterPage.js` - pageVariants wrapper
- `frontend/src/pages/ProfilePage.js` - pageVariants wrapper on all 3 return paths
- `frontend/src/pages/PomodoroPage.js` - pageVariants wrapper, SVG ring with stroke-dashoffset
- `frontend/src/pages/DsaPage.js` - pageVariants wrapper, AnimatePresence accordion height animation

## Decisions Made
- AnimatedRoutes component extracted from App because useLocation must be inside BrowserRouter context
- Used `key={location.pathname}` (not `location.key`) for AnimatePresence — pathname key is stable across reloads and avoids issues with rapid navigation
- ProfilePage has 3 return branches (loading/not-connected/connected) — wrapped each branch independently rather than refactoring to a single return
- Pomodoro SVG ring uses CSS transition on strokeDashoffset rather than motion.circle — avoids framer-motion SVG transform quirks and simpler to reason about
- AnimatePresence `initial={false}` on DSA accordion prevents the expand animation from firing on first page load for already-expanded items

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 (UI Polish) is fully complete — all 3 plans executed and human-verified
- App has production-quality animations, consistent CSS-var design system, and Midnight Indigo dark theme
- Ready for Phase 6: DevOps hardening (Docker Compose, CI/CD, deployment)
- New pages added in Phase 6 should use the established pageVariants pattern
- New modals should use the AnimatePresence + scale+fade modal pattern

---
*Phase: 05-ui-polish*
*Completed: 2026-03-28*
