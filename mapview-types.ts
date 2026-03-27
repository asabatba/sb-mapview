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
	layers?: unknown;
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
	maplibreAssetBaseUrl?: unknown;
	sourceCacheTtlMs?: unknown;
};

export type SourceStyle = {
	lineColor?: string;
	lineWidth?: number;
	lineOpacity?: number;
	lineDasharray?: number[];
	fillColor?: string;
	fillOpacity?: number;
	pointColor?: string;
	pointRadius?: number;
	pointStrokeColor?: string;
	pointStrokeWidth?: number;
	markerColor?: string;
	labelColor?: string;
	labelHaloColor?: string;
	labelHaloWidth?: number;
	labelSize?: number;
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

export type FileLayerConfig = {
	kind: "file";
	id?: string;
	path: string;
	style: SourceStyle;
	visible: boolean;
	popupProperty?: string;
	labelProperty?: string;
	showLabels: boolean;
	showDirection: boolean;
	sourceCacheTtlMs: number;
};

export type MarkerLayerConfig = {
	kind: "markers";
	id?: string;
	visible: boolean;
	markers: MarkerConfig[];
	style: MarkerStyle;
};

export type LayerConfig = FileLayerConfig | MarkerLayerConfig;

export type MapConfig = {
	layers: LayerConfig[];
	height: string;
	center?: Coordinate;
	zoom?: number;
	styleUrl?: string;
	sourceStyle: SourceStyle;
	markerStyle: MarkerStyle;
	fitPadding: number;
	autoFit: boolean;
	maplibreVersion?: string;
	maplibreAssetBaseUrl?: string;
	sourceCacheTtlMs: number;
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

export type RenderFileLayer = FileLayerConfig & {
	sourceData: MapSourceData;
};

export type RenderMarkerLayer = MarkerLayerConfig;

export type RenderLayer = RenderFileLayer | RenderMarkerLayer;

export type RenderPayload = {
	config: MapConfig;
	layers: RenderLayer[];
	styleUrl: string;
	maplibreVersion: string;
	maplibreAssetBaseUrl?: string;
};

export type WidgetRenderResult = {
	html: string;
	script: string;
};
