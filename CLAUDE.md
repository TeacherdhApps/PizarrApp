# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PizarrApp ("Pizarra Táctica") is a client-only interactive football/soccer tactics board built with React 19 + TypeScript + Vite. It runs as both an installable **PWA** and a **Telegram Mini App**. There is no backend — all persistence is `localStorage` and shareable URLs. UI copy is in Spanish.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b (typecheck) then vite build -> dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint (flat config, eslint.config.js)
npm run test      # Vitest run (jsdom)
```

- Run a single test: `npx vitest run path/to/file.test.tsx` (or `npx vitest -t "name"`).
- `src/test/setup.ts` (imports `@testing-library/jest-dom`) exists. Unit tests live next to their source (`*.test.ts`): `hooks/useHistory`, `utils/animation`, `constants/formations`, `utils/storage`, and `types` validators.
- To test PWA/service-worker behavior you must use `npm run build && npm run preview` — the service worker only meaningfully caches the built `/assets/`.

## Architecture

### State lives in one place: `src/App.tsx` (orchestrator, ~700 lines)
`App` holds essentially all application state via `useState` (players `local`/`visitante`, `colors`, `elements`, `arrows`, scoreboard fields, UI toggles) and wires it into presentational components. Logic lives in extracted modules:
- `src/constants/formations.ts` — squad templates + formation layout algorithm (`buildFormationLayout`, `changeFormation`, `autoArrangeTeam`, `findFreeSpot`) plus `isOnField`. Positions are computed in landscape field space; away team is mirrored. **Bench-aware:** `changeFormation` sets the *on-field* count (benching/promoting the difference, keeping the full squad) and `autoArrangeTeam` only re-lays-out on-field players.
- `src/constants/colors.ts` — jersey color palette.
- `src/utils/storage.ts` — all localStorage access (autosave key + `LS_SLOT_KEYS`/`SLOT_COUNT` named slots — currently 6, original 3 keys first so old saves migrate for free), always validated via `isValidTacticaGuardada`. Also `safeFileName` + `parseTacticFile` for `.json` export/import.
- `src/utils/share.ts` — URL-hash compression (`compressToUrlSafe`/`decompressFromUrlSafe`).
- `src/utils/exportTactic.ts` — canvas render + PNG/PDF export (renders zones, dashed/curved arrows, skips benched players). A `TODO(anim)` notes a possible future WebM export of the play animation.
- `src/utils/animation.ts` — play-animation logic: `captureFrame` (snapshot player/ball positions) + `interpolateFrames` (linear interp toward key frames). **Decision:** `Frame` *types + validators* live in `types.ts` (co-located with all other data types, avoids a circular import); the pure capture/interp logic lives here; frame array + playback timing live in `App`/`useAnimation`.
- `src/hooks/` — `usePercentDrag`, `useIsMobile`, `useToast`, `useZoomPan`, `useHistory` (bounded undo/redo snapshot stack), `useAnimation` (rAF play/pause/scrub over frames, produces an interpolated board override without touching live state).

Child components are memoized (`React.memo`) and receive **stable id-based callbacks** (e.g. `onDragEnd(numero, x, y)`) built once in `App` with `useCallback`/`useMemo`, so dragging one token doesn't re-render the other 21. Preserve this pattern: new callbacks passed to memoized children must be referentially stable.

**Mobile coordinate rotation:** field data is stored in landscape space; on mobile the pitch renders portrait. `App` maps screen↔field (`toField()` for input, `screenArrows`/`screenElements` memos for output): screen x = field y, screen y = 100 − field x. The arrow curve control point (`cx`/`cy`) and `handleArrowUpdate` are mapped the same way; non-positional arrow keys like `style` pass through unchanged.

**Undo/redo (`useHistory`):** a debounced (500 ms) effect pushes a full-board snapshot after each settled edit. Because board mutations only touch `App` state at the end of an action (never per animation frame), that's one snapshot per action. Restores go through `applyTactic`; they're no-ops in the stack because the restored state equals the pointer. Loading a slot/link/import sets `pendingHistoryReset` so the next tick resets the stack. `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` (ignored while typing in inputs).

**Play animation:** frames live as `App` state (`frames`) and persist in `TacticaGuardada`. `useAnimation` produces `override` (interpolated `{local, visitante, elements}`) while playing/scrubbing; `App` renders `displayLocal`/`displayVisitante`/`displayElements` (override ?? live) — so playback never mutates the live board (no autosave/history churn). Only on-field players are drawn (`.filter(isOnField)`).

**Bench substitutions use two drag mechanisms on purpose:** on-field movement stays on the percentage-based pointer drag (`usePercentDrag`); bench→field uses **native HTML5 DnD** (bench chip `draggable` → the field is an `onDrop` target that maps the drop point to field %), because the drag crosses from a non-percentage side panel onto the pitch. Field→bench reuses the pointer drag (drop over a `data-bench-dropzone`).

### Core data model — `src/types.ts`
- `Jugador` (player: numero, nombre, x, y, optional `enCancha` — absent/`true` = on the pitch, `false` = benched), `FieldElement` (ball/cone/text/goal/dummy/**zone**; zones add `shape: 'circle'|'rect'` and reuse `scale`/`rotation`), `ArrowItem` (adds `style: 'solid'|'dashed'|'curved'` and, for curves, a Bézier control point `cx`/`cy`), `Frame` (a key-frame snapshot of player + ball positions), and `TacticaGuardada` (the full serializable board state, incl. optional `frames`).
- **All positions are percentages (0–100) of the field container**, never pixels. This is what makes the board resolution-independent and shareable. `usePercentDrag` converts pointer coordinates to these percentages.
- `types.ts` also defines `isValid*` validation guards. These are defense-in-depth: **any data entering from `localStorage` or a shared URL must pass `isValidTacticaGuardada` before use** (see `loadFromLS`/`loadSlot`). Extend these validators whenever you add a field to `TacticaGuardada`.
- The `Window.Telegram` global interface is declared here.

### Persistence & sharing
- Debounced autosave (600 ms) to `localStorage` key `pizarra-tactica`; six named manual save slots under `pizarra-tactica-slot-{1..6}` (extend `LS_SLOT_KEYS`). All reads/writes go through `src/utils/storage.ts`. A whole tactic can also be exported/imported as a `.json` file (validated on import).
- **Shareable links:** board JSON is compressed with the native `CompressionStream('deflate-raw')`, base64url-encoded (`src/utils/share.ts`), and placed in the URL hash. On mount, `App` reads the hash and hydrates state from it via `applyTactic`.

### Dragging — `src/hooks/usePercentDrag.ts`
Custom pointer-based drag hook (replaced Framer Motion to avoid accumulated-offset bugs). Reports positions as container percentages, has a drag threshold (distinguishes tap/click from drag), captures the pointer, prevents touch scroll during drag, batches move updates with `requestAnimationFrame`, and supports an optional `snapStep` (grid snapping, toggled in the UI — `SNAP_STEP = 2.5` in `App`). Reuse this hook for any new draggable element rather than rolling new drag logic.

### Components (`src/components/`)
- `Cancha.tsx` — the pitch: renders field markings and is the drag-constraint container (`canchaRef` from `App`).
- `FichaJugador.tsx` — draggable player token (editable number/name, delete).
- `DraggableElement.tsx` — draggable ball/cone/text/goal/dummy/**zone** elements (supports scale + rotation; zones render behind players/arrows and have a circle↔rect toggle).
- `InteractiveArrow.tsx` — draggable/editable tactical arrows; renders solid/dashed/curved styles (curved has a draggable control handle), with a hover control to cycle style. Rendered via an SVG `viewBox="0 0 100 100" preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"` so path coords are percentages while stroke width stays constant.
- `DesktopSidebar.tsx` / `FloatingMenu.tsx` — controls; desktop uses the sidebar, mobile uses the floating menu (`useIsMobile`, breakpoint ≤768px). Both compose the shared pieces below (incl. the `animationContent` node, `.json` export/import buttons).
- `TeamConfig.tsx` — team panels (formation F7/F9/F11 = on-field count, jersey color, add/remove player, auto-arrange) + a `BanquilloPanel` per team; shared by sidebar and floating menu.
- `BanquilloPanel.tsx` — benched players per team (editable number/name, "to field" button, native HTML5-draggable onto the pitch). Its container carries `data-bench-dropzone={side}`; a field token dropped over it (detected via `document.elementFromPoint` in `FichaJugador`'s drag `onEnd`) is benched.
- `AnimationControls.tsx` — capture/list/reorder/delete frames + play/pause/stop, speed (Lento/Normal/Rápido) and a scrubber. Presentational; wired to `useAnimation` in `App`.
- `TacticSlots.tsx` — the save/load/delete slot rows (count driven by `slotNames.length`).
- `Scoreboard.tsx` — stadium scoreboard (click +1, right-click −1).
- `ZoomControls.tsx` — zoom in/out/reset, snap toggle, fullscreen.
- `ColorPickerPortal.tsx` — jersey color picker (mobile bottom sheet / desktop anchored popover, via portal to escape overflow clipping).

### Export
- PNG/PDF export renders the board to an offscreen `<canvas>` (`renderTacticToCanvas` in `src/utils/exportTactic.ts`), then `toDataURL`. PDF uses a **dynamic import** of `jspdf` (`await import('jspdf')`) to keep it out of the main bundle. On mobile, PNG export uses the Web Share API / saves to camera roll when available.

### Telegram Mini App integration
`telegram-web-app.js` is loaded in `index.html`. On mount `App` calls `window.Telegram.WebApp.ready()`/`expand()` and syncs header/background colors. Feature-detect `window.Telegram?.WebApp` — the same build must also run as a plain PWA.

### PWA
`public/sw.js` (service worker, registered in `main.tsx`), `public/manifest.json`, and icons in `public/`. SW strategy: **cache-first** for Vite `/assets/`, **network-first** for root HTML/config/Telegram SDK. Bump `CACHE_NAME` in `sw.js` when changing the cached shell.

## Conventions & constraints
- **Percentage coordinates everywhere** — keep new positional data in 0–100 space.
- `tsconfig.app.json` enforces `noUnusedLocals`/`noUnusedParameters` and `verbatimModuleSyntax` (use `import type` for type-only imports). `npm run build` typechecks, so unused code fails the build — this has broken Vercel deploys before (see git history).
- Styling is **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js`; configured in `src/index.css`). Fonts: Inter + Orbitron from Google Fonts.
- `index.html` sets a strict CSP; new external origins (scripts, fonts, connections) must be added there or they will be blocked.
