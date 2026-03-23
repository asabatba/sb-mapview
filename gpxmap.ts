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

type GpxSourceData = {
	kind: "gpx";
	trackGeoJson?: GeoJsonData;
	markers: MarkerConfig[];
};

type GeoJsonSourceData = {
	kind: "geojson";
	data: GeoJsonData;
};

type MapSourceData = GpxSourceData | GeoJsonSourceData;

type RenderPayload = {
	config: MapConfig;
	sourceData?: MapSourceData;
	styleUrl: string;
};

const DEFAULT_HEIGHT = "400px";
const DEFAULT_ZOOM = 13;
const DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const MAPLIBRE_VERSION = "5";
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

function decodeXmlEntities(value: string): string {
	return value
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'");
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

		return {
			lat,
			lon,
			label: asString(rawMarker.label),
			popup: asString(rawMarker.popup),
		};
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

function extractWaypoints(gpxContent: string): MarkerConfig[] {
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
		markers.push({ lat, lon, popup });
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
		const waypoints = extractWaypoints(content);
		if (trackPoints.length === 0 && waypoints.length === 0) {
			throw new Error(
				`GPX Map Error: No usable trackpoints or waypoints found in ${sourcePath}`,
			);
		}

		if (trackPoints.length > 0) {
			const markers: MarkerConfig[] = [];
			if (trackPoints.length === 1) {
				markers.push({
					lat: trackPoints[0][0],
					lon: trackPoints[0][1],
					popup: "Track point",
				});
			} else {
				markers.push({
					lat: trackPoints[0][0],
					lon: trackPoints[0][1],
					popup: "Start",
				});
				markers.push({
					lat: trackPoints[trackPoints.length - 1][0],
					lon: trackPoints[trackPoints.length - 1][1],
					popup: "End",
				});
			}

			return {
				kind: "gpx",
				trackGeoJson: createLineFeature(trackPoints),
				markers,
			};
		}

		return {
			kind: "gpx",
			markers: waypoints,
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

export async function insertGPXMap(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;
	await editor.replaceRange(from, to, buildStarterBlock());
}

async function ensureConfigSchemaDefined(): Promise<void> {
	if (!configSchemaRegistration) {
		configSchemaRegistration = Promise.all([
			globalConfig.define("gpxmap.styleUrl", {
				type: "string",
				default: DEFAULT_STYLE_URL,
				description: "MapLibre style URL used by gpxmap.",
			}),
		]).then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadStyleConfig(): Promise<{ styleUrl: string }> {
	await ensureConfigSchemaDefined();

	const configuredStyleUrl = await globalConfig.get(
		"gpxmap.styleUrl",
		DEFAULT_STYLE_URL,
	);

	return {
		styleUrl: asString(configuredStyleUrl) || DEFAULT_STYLE_URL,
	};
}

function createMapScript(payload: RenderPayload, mapId: string): string {
	return `
    (function() {
      const mapId = ${JSON.stringify(mapId)};
      const payload = ${JSON.stringify(payload)};
      const globalKey = "__gpxMapMapLibreLoader";
      const mapStoreKey = "__gpxMapInstances";
      const cssHref = "https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js";

      function loadMapLibre() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-gpxmap-maplibre="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            link.setAttribute('data-gpxmap-maplibre', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.maplibregl !== 'undefined') {
            resolve(globalThis.maplibregl);
            return;
          }

          const existingScript = document.querySelector('script[data-gpxmap-maplibre="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.maplibregl), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load MapLibre GL JS.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = scriptSrc;
          script.setAttribute('data-gpxmap-maplibre', 'true');
          script.onload = () => resolve(globalThis.maplibregl);
          script.onerror = () => reject(new Error('Failed to load MapLibre GL JS.'));
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

      function toLngLat(lat, lon) {
        return [lon, lat];
      }

      function extractFeaturePopupText(feature) {
        const props = feature && feature.properties && typeof feature.properties === 'object'
          ? feature.properties
          : null;

        if (!props) {
          return null;
        }

        return props.popup || props.name || null;
      }

      function collectLngLatCoordinates(input, bucket) {
        if (!Array.isArray(input)) {
          return;
        }

        if (input.length >= 2 && typeof input[0] === 'number' && typeof input[1] === 'number') {
          bucket.push([input[0], input[1]]);
          return;
        }

        input.forEach((item) => collectLngLatCoordinates(item, bucket));
      }

      function collectGeoJsonLngLats(geojson) {
        const points = [];

        function visit(node) {
          if (!node || typeof node !== 'object') {
            return;
          }

          switch (node.type) {
            case 'FeatureCollection':
              (node.features || []).forEach(visit);
              return;
            case 'Feature':
              visit(node.geometry);
              return;
            case 'GeometryCollection':
              (node.geometries || []).forEach(visit);
              return;
            case 'Point':
            case 'MultiPoint':
            case 'LineString':
            case 'MultiLineString':
            case 'Polygon':
            case 'MultiPolygon':
              collectLngLatCoordinates(node.coordinates, points);
              return;
          }
        }

        visit(geojson);
        return points;
      }

      function addMarker(maplibregl, map, markers, fitPoints, markerStore) {
        markers.forEach((marker) => {
          const instance = new maplibregl.Marker()
            .setLngLat(toLngLat(marker.lat, marker.lon));

          if (marker.popup || marker.label) {
            instance.setPopup(
              new maplibregl.Popup({ offset: 25 }).setText(String(marker.popup || marker.label))
            );
          }

          instance.addTo(map);
          markerStore.push(instance);
          fitPoints.push(toLngLat(marker.lat, marker.lon));
        });
      }

      function registerPopupHandler(maplibregl, map, layerId) {
        map.on('click', layerId, (event) => {
          const feature = event.features && event.features[0];
          const popupText = extractFeaturePopupText(feature);
          if (!popupText) {
            return;
          }

          new maplibregl.Popup()
            .setLngLat(event.lngLat)
            .setText(String(popupText))
            .addTo(map);
        });

        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      function addGeoJsonLayers(maplibregl, map, sourceId, data, layerPrefix, fitPoints) {
        const coordinates = collectGeoJsonLngLats(data);
        if (coordinates.length === 0) {
          throw new Error('GeoJSON Error: No renderable features found.');
        }

        map.addSource(sourceId, {
          type: 'geojson',
          data,
        });

        const fillLayerId = layerPrefix + '-fill';
        const lineLayerId = layerPrefix + '-line';
        const pointLayerId = layerPrefix + '-point';

        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.18
          }
        });

        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#2563eb',
            'line-width': 3,
            'line-opacity': 0.9
          }
        });

        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#dc2626',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });

        registerPopupHandler(maplibregl, map, fillLayerId);
        registerPopupHandler(maplibregl, map, lineLayerId);
        registerPopupHandler(maplibregl, map, pointLayerId);

        coordinates.forEach((coordinate) => fitPoints.push(coordinate));
      }

      function cleanupExistingInstance() {
        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existing = globalThis[mapStoreKey][mapId];
        if (!existing) {
          return;
        }

        (existing.markers || []).forEach((marker) => marker.remove());
        if (existing.map) {
          existing.map.remove();
        }
      }

      function initMap(maplibregl) {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        cleanupExistingInstance();

        const config = payload.config;
        const hasExplicitCenter = Array.isArray(config.center);
        const initialCenter = hasExplicitCenter
          ? toLngLat(config.center[0], config.center[1])
          : [0, 0];
        const initialZoom = hasExplicitCenter && typeof config.zoom === 'number'
          ? config.zoom
          : 1;

        const map = new maplibregl.Map({
          container: mapId,
          style: payload.styleUrl,
          center: initialCenter,
          zoom: initialZoom
        });

        const markerStore = [];
        globalThis[mapStoreKey][mapId] = { map, markers: markerStore };

        let initialized = false;
        const initialErrorHandler = (event) => {
          if (initialized) {
            return;
          }

          const message = event && event.error && event.error.message
            ? event.error.message
            : 'Unable to load MapLibre style.';
          renderError('Map Error: ' + message);
          cleanupExistingInstance();
        };

        map.on('error', initialErrorHandler);

        map.once('load', () => {
          initialized = true;
          map.off('error', initialErrorHandler);

          try {
            const fitPoints = [];

            if (payload.sourceData && payload.sourceData.kind === 'gpx') {
              if (payload.sourceData.trackGeoJson) {
                addGeoJsonLayers(
                  maplibregl,
                  map,
                  mapId + '-gpx-source',
                  payload.sourceData.trackGeoJson,
                  mapId + '-gpx',
                  fitPoints
                );
              }

              addMarker(
                maplibregl,
                map,
                payload.sourceData.markers,
                fitPoints,
                markerStore
              );
            }

            if (payload.sourceData && payload.sourceData.kind === 'geojson') {
              addGeoJsonLayers(
                maplibregl,
                map,
                mapId + '-geojson-source',
                payload.sourceData.data,
                mapId + '-geojson',
                fitPoints
              );
            }

            addMarker(maplibregl, map, config.markers, fitPoints, markerStore);

            if (hasExplicitCenter) {
              map.jumpTo({
                center: toLngLat(config.center[0], config.center[1]),
                zoom: typeof config.zoom === 'number' ? config.zoom : ${DEFAULT_ZOOM}
              });
              return;
            }

            if (fitPoints.length === 0) {
              return;
            }

            const bounds = fitPoints.reduce(
              (acc, point) => acc.extend(point),
              new maplibregl.LngLatBounds(fitPoints[0], fitPoints[0])
            );

            const southWest = bounds.getSouthWest();
            const northEast = bounds.getNorthEast();
            if (southWest.lng === northEast.lng && southWest.lat === northEast.lat) {
              map.jumpTo({
                center: [southWest.lng, southWest.lat],
                zoom: ${DEFAULT_ZOOM}
              });
              return;
            }

            map.fitBounds(bounds, {
              padding: 40,
              duration: 0
            });
          } catch (error) {
            const message = error && error.message ? error.message : 'Unable to render map data.';
            renderError('Map Error: ' + message);
            cleanupExistingInstance();
          }
        });
      }

      loadMapLibre().then(initMap).catch((error) => {
        renderError('Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `;
}

export async function renderGPXWidget(
	widgetBody: string,
): Promise<{ html: string; script: string }> {
	try {
		const config = normalizeConfig(parseWidgetConfig(widgetBody));
		const sourceData = config.source
			? await loadSourceData(config.source)
			: undefined;
		const styleConfig = await loadStyleConfig();

		if (!sourceData && config.markers.length === 0 && !config.center) {
			return buildError(
				"Map Error: Provide a source file, at least one marker, or a center coordinate.",
			);
		}

		const mapId = createMapId();
		const html = `<div id="${mapId}" style="height: ${escapeHtml(config.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`;

		return {
			html,
			script: createMapScript({ config, sourceData, ...styleConfig }, mapId),
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown map rendering error.";
		return buildError(message);
	}
}

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
