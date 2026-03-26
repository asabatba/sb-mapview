import { space } from "@silverbulletmd/silverbullet/syscalls";
import { filter, parse } from "txml/txml";

import type {
	Coordinate,
	GeoJsonData,
	MapSourceData,
	MarkerConfig,
	SourceEntry,
} from "./mapview-types.ts";

type TxmlNode = {
	tagName: string;
	attributes: Record<string, string | boolean>;
	children: (TxmlNode | string)[];
};

function localName(tagName: string): string {
	const colon = tagName.lastIndexOf(":");
	return colon === -1 ? tagName : tagName.slice(colon + 1);
}

function nodeLocalName(node: TxmlNode, name: string): boolean {
	return localName(node.tagName).toLowerCase() === name;
}

function textContent(node: TxmlNode): string {
	return node.children
		.filter((c): c is string => typeof c === "string")
		.join("")
		.trim();
}

function parseTrackPoints(nodes: TxmlNode[]): Coordinate[] {
	const trackPoints: Coordinate[] = [];

	for (const node of nodes) {
		const lat = Number.parseFloat(String(node.attributes.lat ?? ""));
		const lon = Number.parseFloat(String(node.attributes.lon ?? ""));
		if (Number.isFinite(lat) && Number.isFinite(lon)) {
			trackPoints.push([lat, lon]);
		}
	}

	return trackPoints;
}

function parseGpxContent(
	gpxContent: string,
	markerColor: string | undefined,
): { trackSegments: Coordinate[][]; waypoints: MarkerConfig[] } | null {
	const nodes = parse(gpxContent) as (TxmlNode | string)[];

	const gpxRoots = filter(nodes, (node: TxmlNode) =>
		nodeLocalName(node, "gpx"),
	);
	if (gpxRoots.length === 0) {
		return null;
	}

	const trackSegments: Coordinate[][] = [];
	for (const gpxRoot of gpxRoots as TxmlNode[]) {
		const tracks = filter([gpxRoot], (node: TxmlNode) =>
			nodeLocalName(node, "trk"),
		) as TxmlNode[];

		for (const track of tracks) {
			const segments = filter([track], (node: TxmlNode) =>
				nodeLocalName(node, "trkseg"),
			) as TxmlNode[];

			if (segments.length === 0) {
				const trackPoints = parseTrackPoints(
					filter([track], (node: TxmlNode) =>
						nodeLocalName(node, "trkpt"),
					) as TxmlNode[],
				);
				if (trackPoints.length > 0) {
					trackSegments.push(trackPoints);
				}
				continue;
			}

			for (const segment of segments) {
				const segmentPoints = parseTrackPoints(
					filter([segment], (node: TxmlNode) =>
						nodeLocalName(node, "trkpt"),
					) as TxmlNode[],
				);
				if (segmentPoints.length > 0) {
					trackSegments.push(segmentPoints);
				}
			}
		}
	}

	const wpts = filter(nodes, (node: TxmlNode) => nodeLocalName(node, "wpt"));
	const waypoints: MarkerConfig[] = [];
	for (const node of wpts as TxmlNode[]) {
		const lat = Number.parseFloat(String(node.attributes.lat ?? ""));
		const lon = Number.parseFloat(String(node.attributes.lon ?? ""));
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			continue;
		}

		const nameNode = node.children.find(
			(c): c is TxmlNode => typeof c !== "string" && nodeLocalName(c, "name"),
		);
		const popup = nameNode ? textContent(nameNode) || "Waypoint" : "Waypoint";
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

const sourceCache = new Map<string, { content: string; timestamp: number }>();
const SOURCE_CACHE_TTL_MS = 5000;

async function readSourceFile(sourcePath: string): Promise<string> {
	const now = Date.now();
	const cached = sourceCache.get(sourcePath);
	if (cached && now - cached.timestamp < SOURCE_CACHE_TTL_MS) {
		return cached.content;
	}

	for (const candidate of sourcePathCandidates(sourcePath)) {
		try {
			const content = new TextDecoder().decode(await space.readFile(candidate));
			sourceCache.set(sourcePath, { content, timestamp: now });
			return content;
		} catch {
			//
		}
	}

	throw new Error(`Map Error: File not found: ${sourcePath}`);
}

export async function loadSourceData(
	source: SourceEntry,
): Promise<MapSourceData> {
	const content = await readSourceFile(source.path);
	const lowerSource = source.path.toLowerCase();

	if (lowerSource.endsWith(".gpx")) {
		const gpx = parseGpxContent(content, source.style.markerColor);
		if (!gpx) {
			throw new Error(
				`GPX Map Error: File is not valid GPX XML: ${source.path}`,
			);
		}

		const { trackSegments, waypoints } = gpx;
		if (trackSegments.length === 0 && waypoints.length === 0) {
			throw new Error(
				`GPX Map Error: No usable trackpoints or waypoints found in ${source.path}`,
			);
		}

		if (trackSegments.length > 0) {
			return {
				kind: "gpx",
				trackGeoJson: createTrackFeatures(trackSegments),
				markers: waypoints,
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
