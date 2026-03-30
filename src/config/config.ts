import {
	DEFAULT_FIT_PADDING,
	DEFAULT_HEIGHT,
	DEFAULT_SOURCE_LINE_COLORS,
} from "./constants.ts";
import type {
	Coordinate,
	FileLayerConfig,
	LayerConfig,
	MapConfig,
	MarkerConfig,
	MarkerLayerConfig,
	MarkerStyle,
	RawMapConfig,
	SourceStyle,
} from "../shared/types.ts";
import { asString } from "../shared/utils.ts";

export function parseWidgetConfig(content: string): RawMapConfig {
	const trimmed = content.trim();
	if (!trimmed) {
		return {};
	}

	if (!trimmed.startsWith("{")) {
		throw new Error("Map config must be a JSON object.");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(trimmed);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown JSON parse error.";
		throw new Error(`Map config must be valid JSON: ${message}`);
	}

	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error("Map config JSON must be an object.");
	}

	return parsed as RawMapConfig;
}

function asCoordinate(value: unknown): Coordinate | undefined {
	if (!Array.isArray(value) || value.length !== 2) {
		return undefined;
	}

	const lat = Number(value[0]);
	const lon = Number(value[1]);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		return undefined;
	}

	return [lat, lon];
}

function parseColorField(
	value: unknown,
	fieldName: string,
	context: string,
): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	const color = asString(value);
	if (!color) {
		throw new Error(`${context}: \`${fieldName}\` must be a non-empty string.`);
	}

	return color;
}

function parseStringField(
	value: unknown,
	fieldName: string,
	context: string,
): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	const stringValue = asString(value);
	if (!stringValue) {
		throw new Error(`${context}: \`${fieldName}\` must be a non-empty string.`);
	}

	return stringValue;
}

function parsePositiveNumberField(
	value: unknown,
	fieldName: string,
	context: string,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	const numberValue = Number(value);
	if (!Number.isFinite(numberValue) || numberValue <= 0) {
		throw new Error(`${context}: \`${fieldName}\` must be a positive number.`);
	}

	return numberValue;
}

function parseNonNegativeNumberField(
	value: unknown,
	fieldName: string,
	context: string,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	const numberValue = Number(value);
	if (!Number.isFinite(numberValue) || numberValue < 0) {
		throw new Error(
			`${context}: \`${fieldName}\` must be a non-negative number.`,
		);
	}

	return numberValue;
}

function parseOpacityField(
	value: unknown,
	fieldName: string,
	context: string,
): number | undefined {
	if (value === undefined) {
		return undefined;
	}

	const numberValue = Number(value);
	if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 1) {
		throw new Error(
			`${context}: \`${fieldName}\` must be a number between 0 and 1.`,
		);
	}

	return numberValue;
}

function parseBooleanField(
	value: unknown,
	fieldName: string,
	context: string,
): boolean | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") {
			return true;
		}
		if (normalized === "false") {
			return false;
		}
	}

	throw new Error(`${context}: \`${fieldName}\` must be a boolean.`);
}

function parseNumberArrayField(
	value: unknown,
	fieldName: string,
	context: string,
): number[] | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (!Array.isArray(value)) {
		throw new Error(
			`${context}: \`${fieldName}\` must be an array of numbers.`,
		);
	}

	const values = value.map((item) => Number(item));
	if (values.some((item) => !Number.isFinite(item) || item <= 0)) {
		throw new Error(
			`${context}: \`${fieldName}\` must contain only positive numbers.`,
		);
	}

	return values;
}

function normalizeSourceStyle(value: unknown, context: string): SourceStyle {
	if (value === undefined) {
		return {};
	}

	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${context} must be an object.`);
	}

	const rawStyle = value as Record<string, unknown>;
	return {
		lineColor: parseColorField(rawStyle.lineColor, "lineColor", context),
		lineWidth: parsePositiveNumberField(
			rawStyle.lineWidth,
			"lineWidth",
			context,
		),
		lineOpacity: parseOpacityField(
			rawStyle.lineOpacity,
			"lineOpacity",
			context,
		),
		lineDasharray: parseNumberArrayField(
			rawStyle.lineDasharray,
			"lineDasharray",
			context,
		),
		fillColor: parseColorField(rawStyle.fillColor, "fillColor", context),
		fillOpacity: parseOpacityField(
			rawStyle.fillOpacity,
			"fillOpacity",
			context,
		),
		pointColor: parseColorField(rawStyle.pointColor, "pointColor", context),
		pointRadius: parsePositiveNumberField(
			rawStyle.pointRadius,
			"pointRadius",
			context,
		),
		pointStrokeColor: parseColorField(
			rawStyle.pointStrokeColor,
			"pointStrokeColor",
			context,
		),
		pointStrokeWidth: parsePositiveNumberField(
			rawStyle.pointStrokeWidth,
			"pointStrokeWidth",
			context,
		),
		markerColor: parseColorField(rawStyle.markerColor, "markerColor", context),
		labelColor: parseColorField(rawStyle.labelColor, "labelColor", context),
		labelHaloColor: parseColorField(
			rawStyle.labelHaloColor,
			"labelHaloColor",
			context,
		),
		labelHaloWidth: parseNonNegativeNumberField(
			rawStyle.labelHaloWidth,
			"labelHaloWidth",
			context,
		),
		labelSize: parsePositiveNumberField(
			rawStyle.labelSize,
			"labelSize",
			context,
		),
	};
}

function mergeSourceStyle(
	base: SourceStyle,
	override: SourceStyle,
): SourceStyle {
	return {
		...base,
		...override,
	};
}

function normalizeMarkerStyle(value: unknown, context: string): MarkerStyle {
	if (value === undefined) {
		return {};
	}

	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${context} must be an object.`);
	}

	const rawStyle = value as Record<string, unknown>;
	return {
		color: parseColorField(rawStyle.color, "color", context),
		scale: parsePositiveNumberField(rawStyle.scale, "scale", context),
		popupBackgroundColor: parseColorField(
			rawStyle.popupBackgroundColor,
			"popupBackgroundColor",
			context,
		),
		popupTextColor: parseColorField(
			rawStyle.popupTextColor,
			"popupTextColor",
			context,
		),
		popupBorderColor: parseColorField(
			rawStyle.popupBorderColor,
			"popupBorderColor",
			context,
		),
		popupClassName: parseStringField(
			rawStyle.popupClassName,
			"popupClassName",
			context,
		),
		popupMaxWidth: parseStringField(
			rawStyle.popupMaxWidth,
			"popupMaxWidth",
			context,
		),
	};
}

function mergeMarkerStyle(
	base: MarkerStyle,
	override: MarkerStyle,
): MarkerStyle {
	return {
		...base,
		...override,
	};
}

function markerStyleFromRecord(
	record: Record<string, unknown>,
	context: string,
): MarkerStyle {
	return {
		color: parseColorField(record.color, "color", context),
		scale: parsePositiveNumberField(record.scale, "scale", context),
		popupBackgroundColor: parseColorField(
			record.popupBackgroundColor,
			"popupBackgroundColor",
			context,
		),
		popupTextColor: parseColorField(
			record.popupTextColor,
			"popupTextColor",
			context,
		),
		popupBorderColor: parseColorField(
			record.popupBorderColor,
			"popupBorderColor",
			context,
		),
		popupClassName: parseStringField(
			record.popupClassName,
			"popupClassName",
			context,
		),
		popupMaxWidth: parseStringField(
			record.popupMaxWidth,
			"popupMaxWidth",
			context,
		),
	};
}

function normalizeMarkers(
	value: unknown,
	defaultStyle: MarkerStyle,
	context = "`markers`",
): MarkerConfig[] {
	if (value === undefined) {
		return [];
	}

	if (!Array.isArray(value)) {
		throw new Error(`${context} must be an array of marker objects.`);
	}

	return value.map((marker, index) => {
		if (!marker || typeof marker !== "object" || Array.isArray(marker)) {
			throw new Error(`${context}: marker ${index + 1} must be an object.`);
		}

		const rawMarker = marker as Record<string, unknown>;
		const lat = Number(rawMarker.lat);
		const lon = Number(rawMarker.lon);
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			throw new Error(
				`${context}: marker ${index + 1} must include numeric \`lat\` and \`lon\`.`,
			);
		}

		const markerStyle = mergeMarkerStyle(
			defaultStyle,
			markerStyleFromRecord(rawMarker, `${context}: marker ${index + 1}`),
		);

		return {
			lat,
			lon,
			label: asString(rawMarker.label),
			popup: asString(rawMarker.popup),
			color: markerStyle.color,
			scale: markerStyle.scale,
			popupBackgroundColor: markerStyle.popupBackgroundColor,
			popupTextColor: markerStyle.popupTextColor,
			popupBorderColor: markerStyle.popupBorderColor,
			popupClassName: markerStyle.popupClassName,
			popupMaxWidth: markerStyle.popupMaxWidth,
		};
	});
}

function parseOptionalId(
	value: unknown,
	fieldName: string,
	context: string,
): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	const id = asString(value);
	if (!id) {
		throw new Error(`${context}: \`${fieldName}\` must be a non-empty string.`);
	}

	return id;
}

function normalizeFileLayer(
	rawLayer: string | Record<string, unknown>,
	index: number,
	defaultStyle: SourceStyle,
	defaultSourceCacheTtlMs: number,
): FileLayerConfig {
	if (typeof rawLayer === "string") {
		const path = asString(rawLayer);
		if (!path) {
			throw new Error(`Layer ${index + 1} must be a non-empty string path.`);
		}

		return {
			kind: "file",
			path,
			style: defaultStyle,
			visible: true,
			showLabels: false,
			showDirection: true,
			sourceCacheTtlMs: defaultSourceCacheTtlMs,
		};
	}

	const path = asString(rawLayer.path);
	if (!path) {
		throw new Error(`Layer ${index + 1} must include a non-empty \`path\`.`);
	}

	return {
		kind: "file",
		id: parseOptionalId(rawLayer.id, "id", `Layer ${index + 1}`),
		path,
		style: mergeSourceStyle(
			defaultStyle,
			normalizeSourceStyle(rawLayer.style, `Layer ${index + 1} style`),
		),
		visible:
			parseBooleanField(rawLayer.visible, "visible", `Layer ${index + 1}`) ??
			true,
		popupProperty: parseStringField(
			rawLayer.popupProperty,
			"popupProperty",
			`Layer ${index + 1}`,
		),
		labelProperty: parseStringField(
			rawLayer.labelProperty,
			"labelProperty",
			`Layer ${index + 1}`,
		),
		showLabels:
			parseBooleanField(
				rawLayer.showLabels,
				"showLabels",
				`Layer ${index + 1}`,
			) ?? false,
		showDirection:
			parseBooleanField(
				rawLayer.showDirection,
				"showDirection",
				`Layer ${index + 1}`,
			) ?? true,
		sourceCacheTtlMs:
			parseNonNegativeNumberField(
				rawLayer.sourceCacheTtlMs,
				"sourceCacheTtlMs",
				`Layer ${index + 1}`,
			) ?? defaultSourceCacheTtlMs,
	};
}

function normalizeMarkerLayer(
	rawLayer: Record<string, unknown>,
	index: number,
	defaultStyle: MarkerStyle,
): MarkerLayerConfig {
	return {
		kind: "markers",
		id: parseOptionalId(rawLayer.id, "id", `Layer ${index + 1}`),
		visible:
			parseBooleanField(rawLayer.visible, "visible", `Layer ${index + 1}`) ??
			true,
		style: mergeMarkerStyle(
			defaultStyle,
			normalizeMarkerStyle(rawLayer.style, `Layer ${index + 1} style`),
		),
		markers: normalizeMarkers(
			rawLayer.markers,
			mergeMarkerStyle(
				defaultStyle,
				normalizeMarkerStyle(rawLayer.style, `Layer ${index + 1} style`),
			),
			`Layer ${index + 1} \`markers\``,
		),
	};
}

function normalizeLayerEntry(
	layerValue: unknown,
	index: number,
	defaultSourceStyle: SourceStyle,
	defaultMarkerStyle: MarkerStyle,
	defaultSourceCacheTtlMs: number,
): LayerConfig {
	if (typeof layerValue === "string") {
		return normalizeFileLayer(
			layerValue,
			index,
			defaultSourceStyle,
			defaultSourceCacheTtlMs,
		);
	}

	if (
		!layerValue ||
		typeof layerValue !== "object" ||
		Array.isArray(layerValue)
	) {
		throw new Error(
			`Layer ${index + 1} must be a string path or an object describing a layer.`,
		);
	}

	const rawLayer = layerValue as Record<string, unknown>;
	const rawKind = asString(rawLayer.kind);
	if (rawKind && rawKind !== "file" && rawKind !== "markers") {
		throw new Error(
			`Layer ${index + 1}: \`kind\` must be either \`file\` or \`markers\`.`,
		);
	}

	const isMarkerLayer =
		rawKind === "markers" || ("markers" in rawLayer && !("path" in rawLayer));
	if (isMarkerLayer) {
		return normalizeMarkerLayer(rawLayer, index, defaultMarkerStyle);
	}

	return normalizeFileLayer(
		rawLayer,
		index,
		defaultSourceStyle,
		defaultSourceCacheTtlMs,
	);
}

function normalizeLayers(
	rawLayers: unknown,
	defaultSourceStyle: SourceStyle,
	defaultMarkerStyle: MarkerStyle,
	defaultSourceCacheTtlMs: number,
): LayerConfig[] {
	if (rawLayers === undefined) {
		return [];
	}

	if (!Array.isArray(rawLayers)) {
		throw new Error("`layers` must be an array.");
	}

	return rawLayers.map((layer, index) =>
		normalizeLayerEntry(
			layer,
			index,
			defaultSourceStyle,
			defaultMarkerStyle,
			defaultSourceCacheTtlMs,
		),
	);
}

function normalizeLegacySourceLayers(
	sourceValue: unknown,
	defaultSourceStyle: SourceStyle,
	defaultSourceCacheTtlMs: number,
): FileLayerConfig[] {
	if (sourceValue === undefined) {
		return [];
	}

	if (Array.isArray(sourceValue)) {
		return sourceValue.map((source, index) =>
			normalizeFileLayer(
				typeof source === "string"
					? source
					: (source as Record<string, unknown>),
				index,
				defaultSourceStyle,
				defaultSourceCacheTtlMs,
			),
		);
	}

	return [
		normalizeFileLayer(
			typeof sourceValue === "string"
				? sourceValue
				: (sourceValue as Record<string, unknown>),
			0,
			defaultSourceStyle,
			defaultSourceCacheTtlMs,
		),
	];
}

function assignDefaultSourceLineColors(layers: LayerConfig[]): LayerConfig[] {
	let colorIndex = 0;
	return layers.map((layer) => {
		if (layer.kind !== "file" || layer.style.lineColor !== undefined) {
			return layer;
		}

		const lineColor =
			DEFAULT_SOURCE_LINE_COLORS[
				colorIndex % DEFAULT_SOURCE_LINE_COLORS.length
			];
		colorIndex += 1;

		return {
			...layer,
			style: {
				...layer.style,
				lineColor,
			},
		};
	});
}

export function normalizeConfig(rawConfig: RawMapConfig): MapConfig {
	const sourceStyle = normalizeSourceStyle(
		rawConfig.sourceStyle,
		"`sourceStyle`",
	);
	const markerStyle = normalizeMarkerStyle(
		rawConfig.markerStyle,
		"`markerStyle`",
	);
	const height = asString(rawConfig.height) || DEFAULT_HEIGHT;
	const center =
		rawConfig.center === undefined ? undefined : asCoordinate(rawConfig.center);
	if (rawConfig.center !== undefined && !center) {
		throw new Error("`center` must be a JSON array like [lat, lon].");
	}

	const zoom =
		rawConfig.zoom === undefined ? undefined : Number(rawConfig.zoom);
	if (rawConfig.zoom !== undefined && !Number.isFinite(zoom)) {
		throw new Error("`zoom` must be a number.");
	}

	const styleUrl =
		rawConfig.styleUrl === undefined ? undefined : asString(rawConfig.styleUrl);
	if (rawConfig.styleUrl !== undefined && !styleUrl) {
		throw new Error("`styleUrl` must be a non-empty string.");
	}

	const fitPadding =
		rawConfig.fitPadding === undefined
			? DEFAULT_FIT_PADDING
			: Number(rawConfig.fitPadding);
	if (!Number.isFinite(fitPadding) || fitPadding < 0) {
		throw new Error("`fitPadding` must be a non-negative number.");
	}

	const autoFit = parseBooleanField(rawConfig.autoFit, "autoFit", "`autoFit`");

	const maplibreVersion =
		rawConfig.maplibreVersion === undefined
			? undefined
			: asString(rawConfig.maplibreVersion);
	if (rawConfig.maplibreVersion !== undefined && !maplibreVersion) {
		throw new Error("`maplibreVersion` must be a non-empty string.");
	}

	const maplibreAssetBaseUrl =
		rawConfig.maplibreAssetBaseUrl === undefined
			? undefined
			: asString(rawConfig.maplibreAssetBaseUrl);
	if (rawConfig.maplibreAssetBaseUrl !== undefined && !maplibreAssetBaseUrl) {
		throw new Error("`maplibreAssetBaseUrl` must be a non-empty string.");
	}

	const sourceCacheTtlMs =
		parseNonNegativeNumberField(
			rawConfig.sourceCacheTtlMs,
			"sourceCacheTtlMs",
			"`sourceCacheTtlMs`",
		) ?? 0;

	const explicitLayers = normalizeLayers(
		rawConfig.layers,
		sourceStyle,
		markerStyle,
		sourceCacheTtlMs,
	);
	const legacySourceLayers = normalizeLegacySourceLayers(
		rawConfig.source,
		sourceStyle,
		sourceCacheTtlMs,
	);
	const legacyMarkerLayer =
		rawConfig.markers === undefined
			? []
			: [
					{
						kind: "markers" as const,
						visible: true,
						style: markerStyle,
						markers: normalizeMarkers(rawConfig.markers, markerStyle),
					},
				];

	return {
		layers: assignDefaultSourceLineColors([
			...explicitLayers,
			...legacySourceLayers,
			...legacyMarkerLayer,
		]),
		height,
		center,
		zoom,
		styleUrl,
		sourceStyle,
		markerStyle,
		fitPadding,
		autoFit: autoFit ?? true,
		maplibreVersion,
		maplibreAssetBaseUrl,
		sourceCacheTtlMs,
	};
}
