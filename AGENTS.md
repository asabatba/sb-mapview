# AGENTS.md

Guidelines for AI agents working on this repository.

## Project Overview

SilverBullet MapView Plug — a SilverBullet plugin that adds a `mapview` code widget for rendering interactive maps using MapLibre GL JS. Supports GPX tracks/waypoints, GeoJSON files, and manual marker layers.

## Build, Lint, and Test Commands

```sh
# Build distributable (outputs mapview.plug.js)
npm run build

# Type-check only (no emit)
npm run typecheck

# Lint with Biome
npm run lint

# Format with Biome
npm run format

# Run tests (no framework, uses Node assert/strict)
npm run test

# Run all checks (lint + typecheck + test)
npm run check
```

**Important:** The distributable `mapview.plug.js` must be rebuilt after any source change before it can be used in SilverBullet. The manifest is `mapview.yaml`.

## Architecture

```
src/
  index.ts            # Plugin entrypoint — exposes SilverBullet functions
  api/index.ts        # Public API exports (currently placeholder)
  config/
    config.ts         # Config parsing and normalization (~750 lines)
    constants.ts      # Default styles and configuration constants
  runtime/
    index.ts          # Builds the inline browser-side runtime script
    script.ts         # Map initialization and rendering (~696 lines)
    asset-helpers.ts  # MapLibre CDN asset loading
    feature-helpers.ts# GeoJSON feature processing (labels, popups)
    popup-helpers.ts  # Popup rendering and styling
    view-helpers.ts   # Camera/fit helpers
  sources/index.ts    # GPX and GeoJSON file loading and parsing
  shared/
    types.ts          # Shared TypeScript types
    utils.ts          # Shared utility functions
test/run.ts           # Self-contained tests (run with node --experimental-strip-types)
```

### Key Architectural Constraints

- **Browser/Node split:** `src/runtime/` code runs inside SilverBullet's browser sandbox. It must not import Node modules or SilverBullet syscalls directly — those are only available in `src/index.ts` and `src/sources/`. The runtime script is serialized as a string by `src/runtime/index.ts` and injected into the widget iframe.
- **No external test framework:** Tests use `node:assert/strict` only. Keep tests framework-free.
- **Layers model:** Config supports an additive `layers` array (preferred) and a legacy `source`/`markers` shape (for backwards compatibility). New features go into the layers model.
- **MapLibre loaded at runtime:** MapLibre GL JS is loaded dynamically from a CDN (default: v5.21.1). The package dev dependency is for types only.

## Code Style

- Formatter and linter: **Biome** (`biome.json`). Run `npm run format` before committing.
- TypeScript strict mode is enabled.
- Avoid adding comments unless the logic is genuinely non-obvious.
- Do not add docstrings or type annotations to code you did not change.

## Testing

Tests live in `test/run.ts`. Run with:

```sh
npm run test
```

Tests cover config parsing, legacy compatibility, layer model, GPX/GeoJSON parsing, view helpers, and feature helpers. Add a test case when fixing a bug or adding a feature that has observable behavior in those areas.

## Exposed Plugin Functions

Defined in `mapview.yaml` and implemented in `src/index.ts`:

| Function | Description |
|---|---|
| `renderMapViewWidget` | Main renderer — called by SilverBullet on each widget render |
| `insertMapView` | Command palette: insert full mapview template |
| `insertMapViewGpx` | Command palette: insert GPX-specific template |
| `insertMapViewGeoJson` | Command palette: insert GeoJSON-specific template |
| `insertMapViewMarkers` | Command palette: insert markers-only template |
| `mapViewSlashComplete` | Slash completion suggestions |

## Common Pitfalls

- Editing source files without rebuilding `mapview.plug.js` will have no effect in SilverBullet.
- Runtime code (`src/runtime/`) cannot use `import` statements that reference Node or SilverBullet APIs — everything needed at runtime must be bundled into the serialized script string.
- `src/config/config.ts` is large; prefer extending existing normalization logic rather than adding new top-level parsing branches.
- The `sourceCacheTtlMs` option controls file caching; do not remove or rename it without updating documentation and tests.
