import { XMLParser } from "fast-xml-parser";

import type {
	Coordinate,
	FileLayerConfig,
	GeoJsonData,
	MapSourceData,
	MarkerConfig,
} from "./mapview-types.ts";

type XmlObject = Record<string, unknown>;
type GpxRoot = {
	trk?: unknown;
	wpt?: unknown;
};

type ReadFileFn = (path: string) => Promise<Uint8Array>;
type ReadSourceOptions = {
	cacheTtlMs?: number;
	readFile?: ReadFileFn;
};

async function defaultReadFile(path: string): Promise<Uint8Array> {
	const { space } = await import("@silverbulletmd/silverbullet/syscalls");
	return space.readFile(path);
}

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
	removeNSPrefix: true,
	parseTagValue: false,
	parseAttributeValue: false,
	trimValues: true,
	isArray: (_tagName, jPath) =>
		jPath === "gpx.trk" ||
		jPath === "gpx.trk.trkseg" ||
		jPath === "gpx.trk.trkseg.trkpt" ||
		jPath === "gpx.trk.trkpt" ||
		jPath === "gpx.wpt",
});

function asArray<T>(value: T | T[] | undefined): T[] {
	if (value === undefined) {
		return [];
	}

	return Array.isArray(value) ? value : [value];
}

function asXmlObject(value: unknown): XmlObject | undefined {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as XmlObject)
		: undefined;
}

function isXmlObject(value: XmlObject | undefined): value is XmlObject {
	return Boolean(value);
}

function asText(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseTrackPoints(nodes: XmlObject[]): Coordinate[] {
	const trackPoints: Coordinate[] = [];

	for (const node of nodes) {
		const lat = Number.parseFloat(String(node.lat ?? ""));
		const lon = Number.parseFloat(String(node.lon ?? ""));
		if (Number.isFinite(lat) && Number.isFinite(lon)) {
			trackPoints.push([lat, lon]);
		}
	}

	return trackPoints;
}

export function parseGpxContent(
	gpxContent: string,
	markerColor: string | undefined,
): { trackSegments: Coordinate[][]; waypoints: MarkerConfig[] } | null {
	let parsed: unknown;
	try {
		parsed = xmlParser.parse(gpxContent);
	} catch {
		return null;
	}

	const gpxRoot = asXmlObject(parsed)?.gpx as GpxRoot | undefined;
	if (!gpxRoot || typeof gpxRoot !== "object") {
		return null;
	}

	const trackSegments: Coordinate[][] = [];
	for (const track of asArray(gpxRoot.trk)
		.map(asXmlObject)
		.filter(isXmlObject)) {
		const segments = asArray(track.trkseg).map(asXmlObject).filter(isXmlObject);

		if (segments.length === 0) {
			const trackPoints = parseTrackPoints(
				asArray(track.trkpt).map(asXmlObject).filter(isXmlObject),
			);
			if (trackPoints.length > 0) {
				trackSegments.push(trackPoints);
			}
			continue;
		}

		for (const segment of segments) {
			const segmentPoints = parseTrackPoints(
				asArray(segment.trkpt).map(asXmlObject).filter(isXmlObject),
			);
			if (segmentPoints.length > 0) {
				trackSegments.push(segmentPoints);
			}
		}
	}

	const waypoints: MarkerConfig[] = [];
	for (const waypoint of asArray(gpxRoot.wpt)
		.map(asXmlObject)
		.filter(isXmlObject)) {
		const lat = Number.parseFloat(String(waypoint.lat ?? ""));
		const lon = Number.parseFloat(String(waypoint.lon ?? ""));
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			continue;
		}

		const popup = asText(waypoint.name) || "Waypoint";
		waypoints.push({ lat, lon, popup, color: markerColor });
	}

	return { trackSegments, waypoints };
}

function createTrackFeatures(
	trackSegments: Coordinate[][],
): GeoJsonData | undefined {
	const lineFeatures = trackSegments
		.filter((segment) => segment.length >= 2)
		.map((segment, index) => ({
			type: "Feature",
			properties: {
				source: "gpx-track",
				segment: index + 1,
			},
			geometry: {
				type: "LineString",
				coordinates: segment.map(([lat, lon]) => [lon, lat]),
			},
		}));

	if (lineFeatures.length === 0) {
		return undefined;
	}

	return {
		type: "FeatureCollection",
		features: lineFeatures,
	};
}

function isSupportedGeoJsonType(type: unknown): boolean {
	return (
		typeof type === "string" &&
		[
			"Feature",
			"FeatureCollection",
			"Point",
			"MultiPoint",
			"LineString",
			"MultiLineString",
			"Polygon",
			"MultiPolygon",
			"GeometryCollection",
		].includes(type)
	);
}

export function parseGeoJson(content: string, sourcePath: string): GeoJsonData {
	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown JSON parse error.";
		throw new Error(`GeoJSON Error: Invalid JSON in ${sourcePath}: ${message}`);
	}

	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(
			`GeoJSON Error: ${sourcePath} must contain a GeoJSON object.`,
		);
	}

	const geoJson = parsed as Record<string, unknown>;
	if (!isSupportedGeoJsonType(geoJson.type)) {
		throw new Error(
			`GeoJSON Error: Unsupported or missing GeoJSON type in ${sourcePath}.`,
		);
	}

	return geoJson;
}

function sourcePathCandidates(sourcePath: string): string[] {
	const trimmed = sourcePath.trim();
	if (!trimmed) {
		return [];
	}

	if (trimmed.startsWith("/")) {
		return [trimmed, trimmed.slice(1)];
	}

	return [trimmed, `/${trimmed}`];
}

const sourceCache = new Map<string, { content: string; timestamp: number }>();

export function clearSourceCache(): void {
	sourceCache.clear();
}

export async function readSourceFile(
	sourcePath: string,
	options: ReadSourceOptions = {},
): Promise<string> {
	const now = Date.now();
	const cacheTtlMs = options.cacheTtlMs ?? 0;
	const cached = sourceCache.get(sourcePath);
	if (cacheTtlMs > 0 && cached && now - cached.timestamp < cacheTtlMs) {
		return cached.content;
	}

	const readFile = options.readFile ?? defaultReadFile;
	for (const candidate of sourcePathCandidates(sourcePath)) {
		try {
			const content = new TextDecoder().decode(await readFile(candidate));
			if (cacheTtlMs > 0) {
				sourceCache.set(sourcePath, { content, timestamp: now });
			} else {
				sourceCache.delete(sourcePath);
			}
			return content;
		} catch {
			//
		}
	}

	throw new Error(`Map Error: File not found: ${sourcePath}`);
}

export async function loadSourceData(
	layer: FileLayerConfig,
	options: ReadSourceOptions = {},
): Promise<MapSourceData> {
	const content = await readSourceFile(layer.path, {
		...options,
		cacheTtlMs: layer.sourceCacheTtlMs,
	});
	const lowerSource = layer.path.toLowerCase();

	if (lowerSource.endsWith(".gpx")) {
		const gpx = parseGpxContent(content, layer.style.markerColor);
		if (!gpx) {
			throw new Error(
				`GPX Map Error: File is not valid GPX XML: ${layer.path}`,
			);
		}

		const { trackSegments, waypoints } = gpx;
		if (trackSegments.length === 0 && waypoints.length === 0) {
			throw new Error(
				`GPX Map Error: No usable trackpoints or waypoints found in ${layer.path}`,
			);
		}

		if (trackSegments.length > 0) {
			return {
				kind: "gpx",
				trackGeoJson: createTrackFeatures(trackSegments),
				markers: waypoints,
				style: layer.style,
			};
		}

		return {
			kind: "gpx",
			markers: waypoints,
			style: layer.style,
		};
	}

	if (lowerSource.endsWith(".geojson") || lowerSource.endsWith(".json")) {
		return {
			kind: "geojson",
			data: parseGeoJson(content, layer.path),
			style: layer.style,
		};
	}

	throw new Error(
		`Map Error: Unsupported file type for ${layer.path}. Use .gpx, .geojson, or .json.`,
	);
}
