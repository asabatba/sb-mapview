import type { SourceStyle } from "./mapview-types.ts";

export const DEFAULT_HEIGHT = "400px";
export const DEFAULT_ZOOM = 13;
export const DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";
export const DEFAULT_SOURCE_STYLE: Required<Omit<SourceStyle, "markerColor">> =
	{
		lineColor: "#2563eb",
		lineWidth: 3,
		lineOpacity: 0.9,
		fillColor: "#3b82f6",
		fillOpacity: 0.18,
		pointColor: "#dc2626",
		pointRadius: 6,
	};
export const MAPLIBRE_VERSION = "5.21.0";
