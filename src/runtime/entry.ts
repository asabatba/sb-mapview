import maplibregl from "maplibre-gl";
import type { MapViewAction, RenderPayload } from "../shared/types.ts";
import { createFeatureHelpers } from "./feature-helpers.ts";
import { createPopupHelpers } from "./popup-helpers.ts";
import { dispatchMapViewAction, runMapView } from "./script.ts";
import { createViewHelpers } from "./view-helpers.ts";

type RuntimeDefaults = Parameters<typeof runMapView>[2];

function init(
	mapId: string,
	payload: RenderPayload,
	defaults: RuntimeDefaults,
): void {
	runMapView(mapId, payload, defaults, maplibregl as never, {
		createFeatureHelpers,
		createPopupHelpers,
		createViewHelpers,
	});
}

(globalThis as Record<string, unknown>).__mapviewInit = init;
(globalThis as Record<string, unknown>).__mapviewDispatch =
	dispatchMapViewAction;

const initQueue = (globalThis as Record<string, unknown>).__mapview_q as
	| Array<[string, RenderPayload, RuntimeDefaults]>
	| undefined;
if (initQueue) {
	initQueue.forEach(([mapId, payload, defaults]) => {
		init(mapId, payload, defaults);
	});
	delete (globalThis as Record<string, unknown>).__mapview_q;
}

const actionQueue = (globalThis as Record<string, unknown>)
	.__mapview_action_q as MapViewAction[] | undefined;
if (actionQueue) {
	actionQueue.forEach((action) => {
		dispatchMapViewAction(action);
	});
	delete (globalThis as Record<string, unknown>).__mapview_action_q;
}
