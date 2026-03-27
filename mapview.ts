import {
	editor,
	config as globalConfig,
} from "@silverbulletmd/silverbullet/syscalls";
import { normalizeConfig, parseWidgetConfig } from "./mapview-config.ts";
import { DEFAULT_STYLE_URL, MAPLIBRE_VERSION } from "./mapview-constants.ts";
import { createMapScript } from "./mapview-runtime.ts";
import { loadSourceData } from "./mapview-sources.ts";
import type { WidgetRenderResult } from "./mapview-types.ts";
import {
	asString,
	buildError,
	createMapId,
	escapeHtml,
} from "./mapview-utils.ts";

let configSchemaRegistration: Promise<void> | undefined;

function buildStarterBlock(): string {
	return `\`\`\`mapview
{
  "styleUrl": "https://demotiles.maplibre.org/style.json",
  "height": "420px",
  "sourceStyle": {
    "lineWidth": 4,
    "lineOpacity": 0.85
  },
  "source": [
    {
      "path": "/path/to/route.gpx",
      "style": {
        "lineColor": "#0f766e",
        "markerColor": "#0f766e"
      }
    },
    {
      "path": "/path/to/pois.geojson",
      "style": {
        "pointColor": "#dc2626",
        "fillColor": "#f59e0b"
      }
    }
  ],
  "markerStyle": {
    "color": "#7c3aed",
    "popupBackgroundColor": "#111827",
    "popupTextColor": "#f8fafc",
    "popupBorderColor": "#334155"
  },
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Example marker",
      "scale": 1.1
    }
  ]
}
\`\`\``;
}

export async function insertMapView(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;
	await editor.replaceRange(from, to, buildStarterBlock());
}

async function ensureConfigSchemaDefined(): Promise<void> {
	if (!configSchemaRegistration) {
		configSchemaRegistration = Promise.all([
			globalConfig.define("mapview.styleUrl", {
				type: "string",
				default: DEFAULT_STYLE_URL,
				description: "MapLibre style URL used by mapview.",
			}),
			globalConfig.define("mapview.maplibreVersion", {
				type: "string",
				default: MAPLIBRE_VERSION,
				description: "MapLibre GL JS version loaded from unpkg CDN by mapview.",
			}),
		]).then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadSpaceConfig(
	widgetStyleUrl?: string,
	widgetMaplibreVersion?: string,
): Promise<{ styleUrl: string; maplibreVersion: string }> {
	await ensureConfigSchemaDefined();

	const styleUrl = widgetStyleUrl
		? widgetStyleUrl
		: asString(await globalConfig.get("mapview.styleUrl", DEFAULT_STYLE_URL)) ||
			DEFAULT_STYLE_URL;

	const maplibreVersion = widgetMaplibreVersion
		? widgetMaplibreVersion
		: asString(
				await globalConfig.get("mapview.maplibreVersion", MAPLIBRE_VERSION),
			) || MAPLIBRE_VERSION;

	return { styleUrl, maplibreVersion };
}

function buildMapHtml(mapId: string, height: string): string {
	return `<div id="${mapId}" style="height: ${escapeHtml(height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`;
}

export async function renderMapViewWidget(
	widgetBody: string,
): Promise<WidgetRenderResult> {
	try {
		const config = normalizeConfig(parseWidgetConfig(widgetBody));
		const sourceData = await Promise.all(config.sources.map(loadSourceData));
		const styleConfig = await loadSpaceConfig(
			config.styleUrl,
			config.maplibreVersion,
		);

		if (
			sourceData.length === 0 &&
			config.markers.length === 0 &&
			!config.center
		) {
			return buildError(
				"Map Error: Provide a source file, at least one marker, or a center coordinate.",
			);
		}

		const mapId = createMapId();
		return {
			html: buildMapHtml(mapId, config.height),
			script: createMapScript({ config, sourceData, ...styleConfig }, mapId),
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown map rendering error.";
		return buildError(message);
	}
}

export function mapViewSlashComplete() {
	return {
		options: [
			{
				label: "mapview",
				detail: "Insert mapview widget",
				invoke: "mapview.insertMapView",
			},
		],
	};
}
