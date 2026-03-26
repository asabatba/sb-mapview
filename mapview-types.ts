import type { MarkerOptions, PopupOptions } from "maplibre-gl";

export type Coordinate = [number, number];

export type SupportedMarkerOptions = Pick<MarkerOptions, "color" | "scale">;
export type SupportedPopupOptions = Pick<
	PopupOptions,
	"className" | "maxWidth"
>;

export type PopupStyle = {
	popupBackgroundColor?: string;
	popupTextColor?: string;
	popupBorderColor?: string;
};

export type RawMapConfig = {
	source?: unknown;
	url?: unknown;
	height?: unknown;
	center?: unknown;
	zoom?: unknown;
	markers?: unknown;
	styleUrl?: unknown;
	sourceStyle?: unknown;
	markerStyle?: unknown;
	fitPadding?: unknown;
	autoFit?: unknown;
	maplibreVersion?: unknown;
};

export type SourceStyle = {
	lineColor?: string;
	lineWidth?: number;
	lineOpacity?: number;
	fillColor?: string;
	fillOpacity?: number;
	pointColor?: string;
	pointRadius?: number;
	pointStrokeColor?: string;
	pointStrokeWidth?: number;
	markerColor?: string;
};

export type MarkerStyle = SupportedMarkerOptions &
	PopupStyle & {
		popupClassName?: SupportedPopupOptions["className"];
		popupMaxWidth?: SupportedPopupOptions["maxWidth"];
	};

export type MarkerConfig = PopupStyle &
	SupportedMarkerOptions & {
		lat: number;
		lon: number;
		label?: string;
		popup?: string;
		popupClassName?: SupportedPopupOptions["className"];
		popupMaxWidth?: SupportedPopupOptions["maxWidth"];
	};

export type SourceEntry = {
	path: string;
	label?: string;
	style: SourceStyle;
};

export type MapConfig = {
	sources: SourceEntry[];
	height: string;
	center?: Coordinate;
	zoom?: number;
	markers: MarkerConfig[];
	styleUrl?: string;
	sourceStyle: SourceStyle;
	markerStyle: MarkerStyle;
	fitPadding: number;
	autoFit: boolean;
	maplibreVersion?: string;
};

export type GeoJsonData = Record<string, unknown>;

export type GpxSourceData = {
	kind: "gpx";
	trackGeoJson?: GeoJsonData;
	markers: MarkerConfig[];
	style: SourceStyle;
};

export type GeoJsonSourceData = {
	kind: "geojson";
	data: GeoJsonData;
	style: SourceStyle;
};

export type MapSourceData = GpxSourceData | GeoJsonSourceData;

export type RenderPayload = {
	config: MapConfig;
	sourceData: MapSourceData[];
	styleUrl: string;
	maplibreVersion: string;
};

export type WidgetRenderResult = {
	html: string;
	script: string;
};
