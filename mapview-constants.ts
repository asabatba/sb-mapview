import type { SourceStyle } from "./mapview-types.ts";

export const DEFAULT_HEIGHT = "400px";
export const DEFAULT_ZOOM = 13;
export const DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";
export const DEFAULT_SOURCE_LINE_COLORS = [
	"#2563eb",
	"#dc2626",
	"#059669",
	"#d97706",
	"#7c3aed",
	"#db2777",
	"#0891b2",
	"#65a30d",
] as const;
export const DEFAULT_SOURCE_STYLE: Required<Omit<SourceStyle, "markerColor">> =
	{
		lineColor: DEFAULT_SOURCE_LINE_COLORS[0],
		lineWidth: 3,
		lineOpacity: 0.9,
		fillColor: "#3b82f6",
		fillOpacity: 0.18,
		pointColor: "#dc2626",
		pointRadius: 6,
	};
export const MAPLIBRE_VERSION = "5.21.0";
