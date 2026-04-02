// Browser-side bundle entry point — compiled by esbuild, not tsc.
// Imports maplibre-gl directly (bundled at build time) and exposes
// a global __mapviewInit function that per-widget scripts call.
import maplibregl from "maplibre-gl";
import type { Map as MaplibreMap } from "maplibre-gl";

import { notifyMapReady } from "./api.ts";
import { createFeatureHelpers } from "./feature-helpers.ts";
import { createPopupHelpers } from "./popup-helpers.ts";
import { createViewHelpers } from "./view-helpers.ts";
import { runMapView, updateMapViewLayers } from "./script.ts";
import type { RenderPayload } from "../shared/types.ts";

type RuntimeDefaults = Parameters<typeof runMapView>[2];

function init(
	mapId: string,
	payload: RenderPayload,
	defaults: RuntimeDefaults,
): void {
	// maplibregl from the import is the full API — cast satisfies our local type
	runMapView(mapId, payload, defaults, maplibregl as never, {
		createFeatureHelpers,
		createPopupHelpers,
		createViewHelpers,
	}, (map) => notifyMapReady(mapId, map as unknown as MaplibreMap));
}

(globalThis as Record<string, unknown>).__mapviewInit = init;
(globalThis as Record<string, unknown>).__mapviewUpdateLayers = updateMapViewLayers;

// Process calls queued before the bundle was injected
const queue = (globalThis as Record<string, unknown>).__mapview_q as
	| Array<[string, RenderPayload, RuntimeDefaults]>
	| undefined;
if (queue) {
	queue.forEach(([m, p, d]) => init(m, p, d));
	delete (globalThis as Record<string, unknown>).__mapview_q;
}
