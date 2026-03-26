import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "./mapview-constants.ts";
import { runMapView } from "./mapview-runtime-script.ts";
import type { RenderPayload } from "./mapview-types.ts";

export function createMapScript(payload: RenderPayload, mapId: string): string {
	return `;(${runMapView.toString()})(${JSON.stringify(mapId)}, ${JSON.stringify(
		payload,
	)}, ${JSON.stringify({
		sourceStyle: DEFAULT_SOURCE_STYLE,
		zoom: DEFAULT_ZOOM,
	})});`;
}
