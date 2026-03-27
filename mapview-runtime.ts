import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "./mapview-constants.ts";
import { createMapLibreAssetHelpers } from "./mapview-runtime-asset-helpers.ts";
import { createFeatureHelpers } from "./mapview-runtime-feature-helpers.ts";
import { createPopupHelpers } from "./mapview-runtime-popup-helpers.ts";
import { runMapView } from "./mapview-runtime-script.ts";
import { createViewHelpers } from "./mapview-runtime-view-helpers.ts";
import type { RenderPayload } from "./mapview-types.ts";

export function createMapScript(payload: RenderPayload, mapId: string): string {
	return `;(() => {
const createFeatureHelpers = ${createFeatureHelpers.toString()};
const createMapLibreAssetHelpers = ${createMapLibreAssetHelpers.toString()};
const createPopupHelpers = ${createPopupHelpers.toString()};
const createViewHelpers = ${createViewHelpers.toString()};
const runMapView = ${runMapView.toString()};
return runMapView(${JSON.stringify(mapId)}, ${JSON.stringify(
		payload,
	)}, ${JSON.stringify({
		sourceStyle: DEFAULT_SOURCE_STYLE,
		zoom: DEFAULT_ZOOM,
	})}, {
	createFeatureHelpers,
	createMapLibreAssetHelpers,
	createPopupHelpers,
	createViewHelpers
});
})();`;
}
