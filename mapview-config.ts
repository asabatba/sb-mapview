import {
	DEFAULT_HEIGHT,
	DEFAULT_SOURCE_LINE_COLORS,
} from "./mapview-constants.ts";
import type {
	Coordinate,
	MapConfig,
	MarkerConfig,
	MarkerStyle,
	RawMapConfig,
	SourceEntry,
	SourceStyle,
} from "./mapview-types.ts";
import { asString } from "./mapview-utils.ts";

function parseLegacyConfig(content: string): RawMapConfig {
	const config: RawMapConfig = {};

	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed) {
			continue;
		}

		const separatorIndex = trimmed.indexOf(":");
		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim().toLowerCase();
		const value = trimmed.slice(separatorIndex + 1).trim();
		if (!value) {
			continue;
		}

		if (
			key === "source" ||
			key === "url" ||
			key === "height" ||
			key === "styleurl"
		) {
			config[key === "styleurl" ? "styleUrl" : key] = value;
		} else if (key === "zoom") {
			config.zoom = Number.parseFloat(value);
		} else if (key === "center") {
			try {
				config.center = JSON.parse(value);
			} catch {
				config.center = value;
			}
		}
	}

	return config;
}

export function parseWidgetConfig(content: string): RawMapConfig {
	const trimmed = content.trim();
	if (!trimmed) {
		return {};
	}

	if (trimmed.startsWith("{")) {
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

	return parseLegacyConfig(content);
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
		markerColor: parseColorField(rawStyle.markerColor, "markerColor", context),
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
): MarkerConfig[] {
	if (value === undefined) {
		return [];
	}

	if (!Array.isArray(value)) {
		throw new Error("`markers` must be an array of marker objects.");
	}

	return value.map((marker, index) => {
		if (!marker || typeof marker !== "object" || Array.isArray(marker)) {
			throw new Error(`Marker ${index + 1} must be an object.`);
		}

		const rawMarker = marker as Record<string, unknown>;
		const lat = Number(rawMarker.lat);
		const lon = Number(rawMarker.lon);
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			throw new Error(
				`Marker ${index + 1} must include numeric \`lat\` and \`lon\`.`,
			);
		}

		const markerStyle = mergeMarkerStyle(
			defaultStyle,
			markerStyleFromRecord(rawMarker, `Marker ${index + 1}`),
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

function normalizeSourceEntry(
	sourceValue: unknown,
	index: number,
	defaultStyle: SourceStyle,
): SourceEntry {
	if (typeof sourceValue === "string") {
		const path = asString(sourceValue);
		if (!path) {
			throw new Error(`Source ${index + 1} must be a non-empty string.`);
		}

		return {
			path,
			style: defaultStyle,
		};
	}

	if (
		!sourceValue ||
		typeof sourceValue !== "object" ||
		Array.isArray(sourceValue)
	) {
		throw new Error(
			`Source ${index + 1} must be a string path or an object with \`path\`.`,
		);
	}

	const rawSource = sourceValue as Record<string, unknown>;
	const path = asString(rawSource.path);
	if (!path) {
		throw new Error(`Source ${index + 1} must include a non-empty \`path\`.`);
	}

	return {
		path,
		style: mergeSourceStyle(
			defaultStyle,
			normalizeSourceStyle(rawSource.style, `Source ${index + 1} style`),
		),
	};
}

function normalizeSources(
	sourceValue: unknown,
	defaultStyle: SourceStyle,
): SourceEntry[] {
	if (sourceValue === undefined) {
		return [];
	}

	if (Array.isArray(sourceValue)) {
		return sourceValue.map((source, index) =>
			normalizeSourceEntry(source, index, defaultStyle),
		);
	}

	return [normalizeSourceEntry(sourceValue, 0, defaultStyle)];
}

function assignDefaultSourceLineColors(sources: SourceEntry[]): SourceEntry[] {
	return sources.map((source, index) => {
		if (source.style.lineColor !== undefined) {
			return source;
		}

		return {
			...source,
			style: {
				...source.style,
				lineColor:
					DEFAULT_SOURCE_LINE_COLORS[index % DEFAULT_SOURCE_LINE_COLORS.length],
			},
		};
	});
}

function normalizeUrlSource(
	urlValue: unknown,
	defaultStyle: SourceStyle,
): SourceEntry[] {
	if (urlValue === undefined) {
		return [];
	}

	const url = asString(urlValue);
	if (!url) {
		throw new Error("`url` must be a non-empty string path.");
	}

	return [
		{
			path: url,
			style: defaultStyle,
		},
	];
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
	const sources =
		rawConfig.source !== undefined
			? normalizeSources(rawConfig.source, sourceStyle)
			: normalizeUrlSource(rawConfig.url, sourceStyle);
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

	return {
		sources: assignDefaultSourceLineColors(sources),
		height,
		center,
		zoom,
		markers: normalizeMarkers(rawConfig.markers, markerStyle),
		styleUrl,
		sourceStyle,
		markerStyle,
	};
}
