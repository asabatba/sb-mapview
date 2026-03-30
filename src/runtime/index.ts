import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "../config/constants.ts";
import { createMapLibreAssetHelpers } from "./asset-helpers.ts";
import { createFeatureHelpers } from "./feature-helpers.ts";
import { createPopupHelpers } from "./popup-helpers.ts";
import { runMapView } from "./script.ts";
import { createViewHelpers } from "./view-helpers.ts";
import type { RenderPayload } from "../shared/types.ts";

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
