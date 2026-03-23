import { editor, space } from "@silverbulletmd/silverbullet/syscalls";

// Extract value from widget body (e.g., "url: /hikes/route.gpx")
function extractValue(content: string, key: string): string | null {
	const regex = new RegExp(`${key}:\\s*(.+)`, "i");
	const match = content.match(regex);
	return match ? match[1].trim() : null;
}

// Command: Insert a GPX map widget at cursor
export async function insertGPXMap(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;

	// Prompt for GPX file path
	const gpxPath = await editor.prompt(
		"Enter GPX file path (e.g., /hikes/my-route.gpx):",
		"",
	);

	if (!gpxPath) return; // User cancelled

	const height =
		(await editor.prompt("Map height (default: 400px):", "400px")) || "400px";

	const block = `\`\`\`gpxmap
url: ${gpxPath}
height: ${height}
\`\`\``;

	await editor.replaceRange(from, to, block);
}

// Code Widget: Renders the Leaflet map
export async function renderGPXWidget(
	widgetBody: string,
): Promise<{ html: string; script: string }> {
	const gpxPath = extractValue(widgetBody, "url");
	const height = extractValue(widgetBody, "height") || "400px";

	if (!gpxPath) {
		return {
			html: `<pre style="color: red;">GPX Map Error: No URL specified. Use: url: /path/to/file.gpx</pre>`,
			script: "",
		};
	}

	// Check if GPX file exists
	const fileExists = await space.fileExists(gpxPath);
	if (!fileExists) {
		return {
			html: `<pre style="color: red;">GPX Map Error: File not found: ${gpxPath}</pre>`,
			script: "",
		};
	}

	// Read the GPX file content
	const gpxData = await space.readFile(gpxPath);
	const gpxContent = new TextDecoder().decode(gpxData);

	// Generate unique ID for this map instance
	const mapId = `gpx-map-${Date.now()}`;

	// HTML with Leaflet map container
	const html = `
    <div id="${mapId}" style="height: ${height}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  `;

	// JavaScript to initialize the map and load GPX
	const script = `
    (function() {
      // Load Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      // Load Leaflet JS
      if (typeof L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        initMap();
      }
      
      function initMap() {
        const mapId = '${mapId}';
        const gpxContent = ${JSON.stringify(gpxContent)};
        
        // Remove existing map if any
        if (window[mapId + '_map']) {
          window[mapId + '_map'].remove();
        }
        
        // Create map
        const map = L.map(mapId).setView([0, 0], 13);
        window[mapId + '_map'] = map;
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Parse GPX and add to map
        const parser = new DOMParser();
        const gpx = parser.parseFromString(gpxContent, 'application/xml');
        
        const trackPoints = [];
        const trkpts = gpx.querySelectorAll('trkpt');
        
        trkpts.forEach(pt => {
          const lat = parseFloat(pt.getAttribute('lat'));
          const lon = parseFloat(pt.getAttribute('lon'));
          if (!isNaN(lat) && !isNaN(lon)) {
            trackPoints.push([lat, lon]);
          }
        });
        
        if (trackPoints.length > 0) {
          // Draw the track
          const polyline = L.polyline(trackPoints, {
            color: '#0066cc',
            weight: 4,
            opacity: 0.8
          }).addTo(map);
          
          // Fit map to track bounds
          map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
          
          // Add start/end markers
          L.marker(trackPoints[0], {
            title: 'Start'
          }).addTo(map).bindPopup('Start');
          
          L.marker(trackPoints[trackPoints.length - 1], {
            title: 'End'
          }).addTo(map).bindPopup('End');
        } else {
          // Try to find waypoints
          const waypoints = gpx.querySelectorAll('wpt');
          waypoints.forEach(wp => {
            const lat = parseFloat(wp.getAttribute('lat'));
            const lon = parseFloat(wp.getAttribute('lon'));
            const name = wp.querySelector('name')?.textContent || 'Waypoint';
            if (!isNaN(lat) && !isNaN(lon)) {
              L.marker([lat, lon]).addTo(map).bindPopup(name);
              trackPoints.push([lat, lon]);
            }
          });
          
          if (trackPoints.length > 0) {
            map.fitBounds(L.latLngBounds(trackPoints), { padding: [20, 20] });
          }
        }
      }
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
