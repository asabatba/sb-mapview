import {
    editor,
    config as globalConfig,
    space,
} from "@silverbulletmd/silverbullet/syscalls";

type Coordinate = [number, number];

type RawMapConfig = {
	source?: unknown;
	url?: unknown;
	height?: unknown;
	center?: unknown;
	zoom?: unknown;
	markers?: unknown;
};

type MarkerConfig = {
	lat: number;
	lon: number;
	label?: string;
	popup?: string;
};

type MapConfig = {
	source?: string;
	height: string;
	center?: Coordinate;
	zoom?: number;
	markers: MarkerConfig[];
};

type GeoJsonData = Record<string, unknown>;

type MapSourceData =
	| {
			kind: "gpx";
			content: string;
	  }
	| {
			kind: "geojson";
			data: GeoJsonData;
	  };

type RenderPayload = {
	config: MapConfig;
	sourceData?: MapSourceData;
	tileUrl: string;
	tileAttribution: string;
};

const DEFAULT_HEIGHT = "400px";
const DEFAULT_ZOOM = 13;
const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_TILE_ATTRIBUTION = "© OpenStreetMap contributors";
let mapInstanceCounter = 0;
let configSchemaRegistration: Promise<void> | undefined;

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function buildError(message: string): { html: string; script: string } {
	return {
		html: `<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(
			message,
		)}</pre>`,
		script: "",
	};
}

function createMapId(): string {
	mapInstanceCounter += 1;

	let randomPart = "";
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		randomPart = crypto.randomUUID();
	} else {
		randomPart = Math.random().toString(36).slice(2, 10);
	}

	return `gpx-map-${mapInstanceCounter}-${randomPart}`;
}

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

		if (key === "source" || key === "url" || key === "height") {
			config[key] = value;
		} else if (key === "zoom") {
			config.zoom = Number.parseFloat(value);
		} else if (key === "center") {
			try {
				config.center = JSON.parse(value);
			} catch {
				// Leave invalid legacy center input alone so normalization reports it cleanly.
				config.center = value;
			}
		}
	}

	return config;
}

function parseWidgetConfig(content: string): RawMapConfig {
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

function asString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
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

function normalizeMarkers(value: unknown): MarkerConfig[] {
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

		const label = asString(rawMarker.label);
		const popup = asString(rawMarker.popup);

		return { lat, lon, label, popup };
	});
}

function normalizeConfig(rawConfig: RawMapConfig): MapConfig {
	const source = asString(rawConfig.source) || asString(rawConfig.url);
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

	return {
		source,
		height,
		center,
		zoom,
		markers: normalizeMarkers(rawConfig.markers),
	};
}

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
	let lastError: unknown;

	for (const candidate of sourcePathCandidates(sourcePath)) {
		try {
			return new TextDecoder().decode(await space.readFile(candidate));
		} catch (error) {
			lastError = error;
		}
	}

	const message = lastError instanceof Error ? lastError.message : "";
	if (message) {
		throw new Error(`Map Error: File not found: ${sourcePath}`);
	}

	throw new Error(`Map Error: File not found: ${sourcePath}`);
}

async function loadSourceData(sourcePath: string): Promise<MapSourceData> {
	const content = await readSourceFile(sourcePath);
	const lowerSource = sourcePath.toLowerCase();

	if (lowerSource.endsWith(".gpx")) {
		if (!hasGpxRoot(content)) {
			throw new Error(
				`GPX Map Error: File is not valid GPX XML: ${sourcePath}`,
			);
		}

		const trackPoints = extractCoordinates(content, "trkpt");
		const waypoints = extractCoordinates(content, "wpt");
		if (trackPoints.length === 0 && waypoints.length === 0) {
			throw new Error(
				`GPX Map Error: No usable trackpoints or waypoints found in ${sourcePath}`,
			);
		}

		return {
			kind: "gpx",
			content,
		};
	}

	if (lowerSource.endsWith(".geojson") || lowerSource.endsWith(".json")) {
		return {
			kind: "geojson",
			data: parseGeoJson(content, sourcePath),
		};
	}

	throw new Error(
		`Map Error: Unsupported file type for ${sourcePath}. Use .gpx, .geojson, or .json.`,
	);
}

function buildStarterBlock(): string {
	return `\`\`\`gpxmap
{
  "height": "400px",
  "source": "/path/to/data.gpx",
  "center": [41.3874, 2.1686],
  "zoom": 13,
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Example marker"
    }
  ]
}
\`\`\``;
}

// Command: Insert a generic map widget at cursor
export async function insertGPXMap(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;
	await editor.replaceRange(from, to, buildStarterBlock());
}

async function ensureConfigSchemaDefined(): Promise<void> {
	if (!configSchemaRegistration) {
		configSchemaRegistration = Promise.all([
			globalConfig.define("gpxmap.tileUrl", {
				type: "string",
				default: DEFAULT_TILE_URL,
				description: "Leaflet tile URL template used by gpxmap.",
			}),
			globalConfig.define("gpxmap.tileAttribution", {
				type: "string",
				default: DEFAULT_TILE_ATTRIBUTION,
				description: "Leaflet attribution text used by gpxmap.",
			}),
		]).then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadTileConfig(): Promise<{
	tileUrl: string;
	tileAttribution: string;
}> {
	await ensureConfigSchemaDefined();

	const configuredTileUrl = await globalConfig.get(
		"gpxmap.tileUrl",
		DEFAULT_TILE_URL,
	);
	const configuredTileAttribution = await globalConfig.get(
		"gpxmap.tileAttribution",
		DEFAULT_TILE_ATTRIBUTION,
	);

	return {
		tileUrl: asString(configuredTileUrl) || DEFAULT_TILE_URL,
		tileAttribution:
			asString(configuredTileAttribution) || DEFAULT_TILE_ATTRIBUTION,
	};
}

function createMapScript(payload: RenderPayload, mapId: string): string {
	return `
    (function() {
      const mapId = ${JSON.stringify(mapId)};
      const payload = ${JSON.stringify(payload)};
      const globalKey = "__gpxMapLeafletLoader";
      const mapStoreKey = "__gpxMapInstances";

      function loadLeaflet() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-gpxmap-leaflet="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.setAttribute('data-gpxmap-leaflet', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.L !== 'undefined') {
            resolve(globalThis.L);
            return;
          }

          const existingScript = document.querySelector('script[data-gpxmap-leaflet="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.L), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Leaflet.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.setAttribute('data-gpxmap-leaflet', 'true');
          script.onload = () => resolve(globalThis.L);
          script.onerror = () => reject(new Error('Failed to load Leaflet.'));
          document.head.appendChild(script);
        });

        return globalThis[globalKey];
      }

      function renderError(message) {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        element.outerHTML =
          '<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">' +
          message
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;') +
          '</pre>';
      }

      function parseCoordinates(doc, selector) {
        return Array.from(doc.querySelectorAll(selector))
          .map((point) => {
            const lat = Number.parseFloat(point.getAttribute('lat') || '');
            const lon = Number.parseFloat(point.getAttribute('lon') || '');
            return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null;
          })
          .filter(Boolean);
      }

      function parseWaypoints(doc) {
        return Array.from(doc.querySelectorAll('wpt'))
          .map((point) => {
            const lat = Number.parseFloat(point.getAttribute('lat') || '');
            const lon = Number.parseFloat(point.getAttribute('lon') || '');
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
              return null;
            }

            const nameNode = point.querySelector('name');
            return {
              coordinate: [lat, lon],
              name: nameNode && nameNode.textContent ? nameNode.textContent : 'Waypoint'
            };
          })
          .filter(Boolean);
      }

      function bindPopupIfPresent(layer, text) {
        if (text) {
          layer.bindPopup(String(text));
        }
      }

      function initMap() {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existingMap = globalThis[mapStoreKey][mapId];
        if (existingMap) {
          existingMap.remove();
        }

        const config = payload.config;
        const hasExplicitCenter = Array.isArray(config.center);
        const initialCenter = hasExplicitCenter ? config.center : [0, 0];
        const initialZoom = hasExplicitCenter && typeof config.zoom === 'number'
          ? config.zoom
          : ${DEFAULT_ZOOM};

        const map = L.map(mapId).setView(initialCenter, initialZoom);
        globalThis[mapStoreKey][mapId] = map;

        L.tileLayer(payload.tileUrl, {
          attribution: payload.tileAttribution
        }).addTo(map);

        const fitCoordinates = [];

        function addFitCoordinate(coordinate) {
          fitCoordinates.push(coordinate);
        }

        function addBounds(bounds) {
          if (!bounds || !bounds.isValid()) {
            return;
          }

          const southWest = bounds.getSouthWest();
          const northEast = bounds.getNorthEast();
          addFitCoordinate([southWest.lat, southWest.lng]);
          addFitCoordinate([northEast.lat, northEast.lng]);
        }

        if (payload.sourceData && payload.sourceData.kind === 'gpx') {
          const parser = new DOMParser();
          const gpx = parser.parseFromString(payload.sourceData.content, 'application/xml');
          if (gpx.querySelector('parsererror')) {
            renderError('GPX Map Error: Could not parse GPX XML.');
            return;
          }

          const tracks = parseCoordinates(gpx, 'trkpt');
          const waypoints = parseWaypoints(gpx);

          if (tracks.length === 0 && waypoints.length === 0) {
            renderError('GPX Map Error: No usable trackpoints or waypoints found.');
            return;
          }

          if (tracks.length > 0) {
            const polyline = L.polyline(tracks, {
              color: '#0066cc',
              weight: 4,
              opacity: 0.8
            }).addTo(map);
            addBounds(polyline.getBounds());

            L.marker(tracks[0], { title: 'Start' }).addTo(map).bindPopup('Start');
            L.marker(tracks[tracks.length - 1], { title: 'End' }).addTo(map).bindPopup('End');
          } else {
            waypoints.forEach((point) => {
              L.marker(point.coordinate).addTo(map).bindPopup(point.name);
              addFitCoordinate(point.coordinate);
            });
          }
        }

        if (payload.sourceData && payload.sourceData.kind === 'geojson') {
          const geoJsonLayer = L.geoJSON(payload.sourceData.data, {
            onEachFeature: (feature, layer) => {
              const props = feature && feature.properties && typeof feature.properties === 'object'
                ? feature.properties
                : null;
              const popupText = props && (props.popup || props.name);
              bindPopupIfPresent(layer, popupText);
            }
          }).addTo(map);
          const geoJsonBounds = geoJsonLayer.getBounds();
          if (!geoJsonBounds.isValid()) {
            if (config.markers.length === 0) {
              renderError('GeoJSON Error: No renderable features found.');
              return;
            }
          } else {
            addBounds(geoJsonBounds);
          }
        }

        config.markers.forEach((marker) => {
          const layer = L.marker([marker.lat, marker.lon]).addTo(map);
          bindPopupIfPresent(layer, marker.popup || marker.label);
          addFitCoordinate([marker.lat, marker.lon]);
        });

        if (hasExplicitCenter) {
          map.setView(config.center, typeof config.zoom === 'number' ? config.zoom : ${DEFAULT_ZOOM});
          return;
        }

        if (fitCoordinates.length === 0) {
          return;
        }

        const bounds = L.latLngBounds(fitCoordinates);
        if (!bounds.isValid()) {
          return;
        }

        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        if (southWest.lat === northEast.lat && southWest.lng === northEast.lng) {
          map.setView([southWest.lat, southWest.lng], ${DEFAULT_ZOOM});
          return;
        }

        map.fitBounds(bounds, { padding: [20, 20] });
      }

      loadLeaflet().then(initMap).catch((error) => {
        renderError('Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `;
}

// Code Widget: Renders the Leaflet map
export async function renderGPXWidget(
	widgetBody: string,
): Promise<{ html: string; script: string }> {
	try {
		const config = normalizeConfig(parseWidgetConfig(widgetBody));
		const sourceData = config.source
			? await loadSourceData(config.source)
			: undefined;
		const tileConfig = await loadTileConfig();

		if (!sourceData && config.markers.length === 0 && !config.center) {
			return buildError(
				"Map Error: Provide a source file, at least one marker, or a center coordinate.",
			);
		}

		const mapId = createMapId();
		const html = `<div id="${mapId}" style="height: ${escapeHtml(config.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>`;

		return {
			html,
			script: createMapScript({ config, sourceData, ...tileConfig }, mapId),
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown map rendering error.";
		return buildError(message);
	}
}

// Slash command for quick insertion
export function gpxSlashComplete() {
	return {
		options: [
			{
				label: "gpxmap",
				detail: "Insert generic map widget",
				invoke: "gpxmap.insertGPXMap",
			},
		],
	};
}
