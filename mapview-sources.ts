import { space } from "@silverbulletmd/silverbullet/syscalls";

import type {
	Coordinate,
	GeoJsonData,
	MapSourceData,
	MarkerConfig,
	SourceEntry,
} from "./mapview-types.ts";
import { decodeXmlEntities } from "./mapview-utils.ts";

function extractCoordinates(
	gpxContent: string,
	tagName: "trkpt" | "wpt",
): Coordinate[] {
	const matches = gpxContent.matchAll(
		new RegExp(
			`<${tagName}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,
			"gi",
		),
	);

	const coordinates: Coordinate[] = [];
	for (const match of matches) {
		const lat = Number.parseFloat(match[1]);
		const lon = Number.parseFloat(match[2]);
		if (Number.isFinite(lat) && Number.isFinite(lon)) {
			coordinates.push([lat, lon]);
		}
	}

	return coordinates;
}

function extractWaypoints(
	gpxContent: string,
	markerColor?: string,
): MarkerConfig[] {
	const waypoints = gpxContent.matchAll(
		/<wpt\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/wpt>/gi,
	);

	const markers: MarkerConfig[] = [];
	for (const match of waypoints) {
		const lat = Number.parseFloat(match[1]);
		const lon = Number.parseFloat(match[2]);
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			continue;
		}

		const nameMatch = match[3].match(/<name\b[^>]*>([\s\S]*?)<\/name>/i);
		const popup = nameMatch
			? decodeXmlEntities(nameMatch[1].trim())
			: "Waypoint";
		markers.push({ lat, lon, popup, color: markerColor });
	}

	return markers;
}

function createLineFeature(trackPoints: Coordinate[]): GeoJsonData | undefined {
	if (trackPoints.length < 2) {
		return undefined;
	}

	return {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {
					source: "gpx-track",
				},
				geometry: {
					type: "LineString",
					coordinates: trackPoints.map(([lat, lon]) => [lon, lat]),
				},
			},
		],
	};
}

function hasGpxRoot(gpxContent: string): boolean {
	return /<(?:\w+:)?gpx\b/i.test(gpxContent);
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

function parseGeoJson(content: string, sourcePath: string): GeoJsonData {
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

async function readSourceFile(sourcePath: string): Promise<string> {
	for (const candidate of sourcePathCandidates(sourcePath)) {
		try {
			return new TextDecoder().decode(await space.readFile(candidate));
		} catch {
			//
		}
	}

	throw new Error(`Map Error: File not found: ${sourcePath}`);
}

function buildTrackMarkers(
	trackPoints: Coordinate[],
	markerColor?: string,
): MarkerConfig[] {
	if (trackPoints.length === 1) {
		return [
			{
				lat: trackPoints[0][0],
				lon: trackPoints[0][1],
				popup: "Track point",
				color: markerColor,
			},
		];
	}

	return [
		{
			lat: trackPoints[0][0],
			lon: trackPoints[0][1],
			popup: "Start",
			color: markerColor,
		},
		{
			lat: trackPoints[trackPoints.length - 1][0],
			lon: trackPoints[trackPoints.length - 1][1],
			popup: "End",
			color: markerColor,
		},
	];
}

export async function loadSourceData(
	source: SourceEntry,
): Promise<MapSourceData> {
	const content = await readSourceFile(source.path);
	const lowerSource = source.path.toLowerCase();

	if (lowerSource.endsWith(".gpx")) {
		if (!hasGpxRoot(content)) {
			throw new Error(
				`GPX Map Error: File is not valid GPX XML: ${source.path}`,
			);
		}

		const trackPoints = extractCoordinates(content, "trkpt");
		const waypoints = extractWaypoints(content, source.style.markerColor);
		if (trackPoints.length === 0 && waypoints.length === 0) {
			throw new Error(
				`GPX Map Error: No usable trackpoints or waypoints found in ${source.path}`,
			);
		}

		if (trackPoints.length > 0) {
			return {
				kind: "gpx",
				trackGeoJson: createLineFeature(trackPoints),
				// markers: buildTrackMarkers(trackPoints, source.style.markerColor),
				markers: [],
				style: source.style,
			};
		}

		return {
			kind: "gpx",
			markers: waypoints,
			style: source.style,
		};
	}

	if (lowerSource.endsWith(".geojson") || lowerSource.endsWith(".json")) {
		return {
			kind: "geojson",
			data: parseGeoJson(content, source.path),
			style: source.style,
		};
	}

	throw new Error(
		`Map Error: Unsupported file type for ${source.path}. Use .gpx, .geojson, or .json.`,
	);
}
