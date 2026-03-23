import { editor, space } from "@silverbulletmd/silverbullet/syscalls";

type WidgetConfig = {
	url?: string;
	height?: string;
};

type Coordinate = [number, number];

const DEFAULT_HEIGHT = "400px";
let mapInstanceCounter = 0;

function parseWidgetConfig(content: string): WidgetConfig {
	const config: WidgetConfig = {};

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

		if (key === "url") {
			config.url = value;
		} else if (key === "height") {
			config.height = value;
		}
	}

	return config;
}

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
		html:
			`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${
				escapeHtml(message)
			}</pre>`,
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

function extractWaypointCount(gpxContent: string): number {
	return extractCoordinates(gpxContent, "wpt").length;
}

function hasXmlParseError(gpxContent: string): boolean {
	return !/<(?:\w+:)?gpx\b/i.test(gpxContent);
}

// Command: Insert a GPX map widget at cursor
export async function insertGPXMap(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;

	const gpxPath = await editor.prompt(
		"Enter GPX file path (e.g., /hikes/my-route.gpx):",
		"",
	);

	if (!gpxPath?.trim()) {
		return;
	}

	const height =
		(await editor.prompt("Map height (default: 400px):", DEFAULT_HEIGHT)) ||
		DEFAULT_HEIGHT;

	const block = `\`\`\`gpxmap
url: ${gpxPath.trim()}
height: ${height.trim() || DEFAULT_HEIGHT}
\`\`\``;

	await editor.replaceRange(from, to, block);
}

// Code Widget: Renders the Leaflet map
export async function renderGPXWidget(
	widgetBody: string,
): Promise<{ html: string; script: string }> {
	const config = parseWidgetConfig(widgetBody);
	const gpxPath = config.url;
	const height = config.height || DEFAULT_HEIGHT;

	if (!gpxPath) {
		return buildError(
			"GPX Map Error: No URL specified. Use: url: /path/to/file.gpx",
		);
	}

	const fileExists = await space.fileExists(gpxPath);
	if (!fileExists) {
		return buildError(`GPX Map Error: File not found: ${gpxPath}`);
	}

	const gpxData = await space.readFile(gpxPath);
	const gpxContent = new TextDecoder().decode(gpxData);

	if (hasXmlParseError(gpxContent)) {
		return buildError(`GPX Map Error: File is not valid GPX XML: ${gpxPath}`);
	}

	const trackPoints = extractCoordinates(gpxContent, "trkpt");
	const waypointCount = extractWaypointCount(gpxContent);

	if (trackPoints.length === 0 && waypointCount === 0) {
		return buildError(
			`GPX Map Error: No usable trackpoints or waypoints found in ${gpxPath}`,
		);
	}

	const mapId = createMapId();
	const html =
		`<div id="${mapId}" style="height: ${escapeHtml(height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>`;

	const script = `
    (function() {
      const mapId = ${JSON.stringify(mapId)};
      const gpxContent = ${JSON.stringify(gpxContent)};
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

      function initMap() {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        const parser = new DOMParser();
        const gpx = parser.parseFromString(gpxContent, 'application/xml');
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

        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existingMap = globalThis[mapStoreKey][mapId];
        if (existingMap) {
          existingMap.remove();
        }

        const map = L.map(mapId).setView([0, 0], 13);
        globalThis[mapStoreKey][mapId] = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (tracks.length > 0) {
          const polyline = L.polyline(tracks, {
            color: '#0066cc',
            weight: 4,
            opacity: 0.8
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
          L.marker(tracks[0], { title: 'Start' }).addTo(map).bindPopup('Start');
          L.marker(tracks[tracks.length - 1], { title: 'End' }).addTo(map).bindPopup('End');
          return;
        }

        waypoints.forEach((point) => {
          L.marker(point.coordinate).addTo(map).bindPopup(point.name);
        });
        map.fitBounds(L.latLngBounds(waypoints.map((point) => point.coordinate)), { padding: [20, 20] });
      }

      loadLeaflet().then(initMap).catch((error) => {
        renderError('GPX Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `;

	return { html, script };
}

// Slash command for quick insertion
export function gpxSlashComplete() {
	return {
		options: [
			{
				label: "gpxmap",
				detail: "Insert GPX map widget",
				invoke: "gpxmap.insertGPXMap",
			},
		],
	};
}
