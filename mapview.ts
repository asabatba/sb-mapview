import {
	editor,
	config as globalConfig,
} from "@silverbulletmd/silverbullet/syscalls";
import { normalizeConfig, parseWidgetConfig } from "./mapview-config.ts";
import { DEFAULT_STYLE_URL } from "./mapview-constants.ts";
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
		]).then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadStyleConfig(
	widgetStyleUrl?: string,
): Promise<{ styleUrl: string }> {
	await ensureConfigSchemaDefined();

	if (widgetStyleUrl) {
		return { styleUrl: widgetStyleUrl };
	}

	const configuredStyleUrl = await globalConfig.get(
		"mapview.styleUrl",
		DEFAULT_STYLE_URL,
	);

	return {
		styleUrl: asString(configuredStyleUrl) || DEFAULT_STYLE_URL,
	};
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
		const styleConfig = await loadStyleConfig(config.styleUrl);

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

export function renderGPXWidget(
	widgetBody: string,
): Promise<WidgetRenderResult> {
	return renderMapViewWidget(widgetBody);
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

export function gpxSlashComplete() {
	return {
		options: [
			{
				label: "gpxmap",
				detail: "Insert legacy gpxmap widget",
				invoke: "mapview.insertMapView",
			},
			{
				label: "mapview",
				detail: "Insert mapview widget",
				invoke: "mapview.insertMapView",
			},
		],
	};
}
