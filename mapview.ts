import {
	editor,
	config as globalConfig,
} from "@silverbulletmd/silverbullet/syscalls";
import { normalizeConfig, parseWidgetConfig } from "./mapview-config.ts";
import { DEFAULT_STYLE_URL, MAPLIBRE_VERSION } from "./mapview-constants.ts";
import { createMapScript } from "./mapview-runtime.ts";
import { loadSourceData } from "./mapview-sources.ts";
import type {
	LayerConfig,
	RenderFileLayer,
	RenderLayer,
	WidgetRenderResult,
} from "./mapview-types.ts";
import {
	asString,
	buildError,
	createMapId,
	escapeHtml,
} from "./mapview-utils.ts";

let configSchemaRegistration: Promise<void> | undefined;

const STARTER_BLOCKS = {
	default: `\`\`\`mapview
{
  "styleUrl": "https://demotiles.maplibre.org/style.json",
  "height": "420px",
  "layers": [
    {
      "path": "/path/to/route.gpx",
      "style": {
        "lineColor": "#0f766e",
        "markerColor": "#0f766e"
      },
      "showDirection": true
    },
    {
      "path": "/path/to/pois.geojson",
      "style": {
        "pointColor": "#dc2626",
        "fillColor": "#f59e0b"
      },
      "popupProperty": "description",
      "labelProperty": "name",
      "showLabels": true
    },
    {
      "kind": "markers",
      "markers": [
        {
          "lat": 41.3874,
          "lon": 2.1686,
          "popup": "Example marker",
          "scale": 1.1
        }
      ],
      "style": {
        "color": "#7c3aed",
        "popupBackgroundColor": "#111827",
        "popupTextColor": "#f8fafc",
        "popupBorderColor": "#334155"
      }
    }
  ]
}
\`\`\``,
	gpx: `\`\`\`mapview
{
  "height": "400px",
  "layers": [
    {
      "path": "/hikes/my-route.gpx",
      "style": {
        "lineColor": "#0f766e",
        "lineWidth": 4,
        "markerColor": "#0f766e"
      },
      "showDirection": true
    }
  ]
}
\`\`\``,
	geojson: `\`\`\`mapview
{
  "height": "420px",
  "layers": [
    {
      "path": "/maps/city.geojson",
      "style": {
        "fillColor": "#3b82f6",
        "fillOpacity": 0.2,
        "lineColor": "#1d4ed8",
        "pointColor": "#dc2626"
      },
      "popupProperty": "description",
      "labelProperty": "name",
      "showLabels": true
    }
  ]
}
\`\`\``,
	markers: `\`\`\`mapview
{
  "height": "400px",
  "center": [41.3874, 2.1686],
  "zoom": 13,
  "layers": [
    {
      "kind": "markers",
      "style": {
        "color": "#7c3aed",
        "popupBackgroundColor": "#111827",
        "popupTextColor": "#f8fafc",
        "popupBorderColor": "#334155"
      },
      "markers": [
        {
          "lat": 41.3874,
          "lon": 2.1686,
          "popup": "Barcelona"
        },
        {
          "lat": 41.4036,
          "lon": 2.1744,
          "label": "Sagrada Familia",
          "color": "#dc2626",
          "scale": 1.2
        }
      ]
    }
  ]
}
\`\`\``,
};

type StarterPreset = keyof typeof STARTER_BLOCKS;

async function insertStarterBlock(preset: StarterPreset): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;
	await editor.replaceRange(from, to, STARTER_BLOCKS[preset]);
}

export async function insertMapView(): Promise<void> {
	await insertStarterBlock("default");
}

export async function insertMapViewGpx(): Promise<void> {
	await insertStarterBlock("gpx");
}

export async function insertMapViewGeoJson(): Promise<void> {
	await insertStarterBlock("geojson");
}

export async function insertMapViewMarkers(): Promise<void> {
	await insertStarterBlock("markers");
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
				description: "MapLibre GL JS version loaded by mapview.",
			}),
			globalConfig.define("mapview.maplibreAssetBaseUrl", {
				type: "string",
				default: "",
				description:
					"Optional base URL for self-hosted MapLibre assets ending at the directory containing maplibre-gl.js and maplibre-gl.css.",
			}),
		]).then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadSpaceConfig(
	widgetStyleUrl?: string,
	widgetMaplibreVersion?: string,
	widgetMaplibreAssetBaseUrl?: string,
): Promise<{
	maplibreAssetBaseUrl?: string;
	maplibreVersion: string;
	styleUrl: string;
}> {
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

	const maplibreAssetBaseUrl =
		widgetMaplibreAssetBaseUrl ||
		asString(await globalConfig.get("mapview.maplibreAssetBaseUrl", ""));

	return { styleUrl, maplibreVersion, maplibreAssetBaseUrl };
}

function buildMapHtml(mapId: string, height: string): string {
	return `<div id="${mapId}" style="height: ${escapeHtml(height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`;
}

async function buildRenderLayer(layer: LayerConfig): Promise<RenderLayer> {
	if (layer.kind !== "file") {
		return layer;
	}

	return {
		...layer,
		sourceData: await loadSourceData(layer),
	} satisfies RenderFileLayer;
}

export async function renderMapViewWidget(
	widgetBody: string,
): Promise<WidgetRenderResult> {
	try {
		const config = normalizeConfig(parseWidgetConfig(widgetBody));
		const visibleLayers = config.layers.filter((layer) => layer.visible);
		const renderLayers = await Promise.all(visibleLayers.map(buildRenderLayer));
		const styleConfig = await loadSpaceConfig(
			config.styleUrl,
			config.maplibreVersion,
			config.maplibreAssetBaseUrl,
		);

		if (renderLayers.length === 0 && !config.center) {
			return buildError(
				"Map Error: Provide at least one visible layer or a center coordinate.",
			);
		}

		const mapId = createMapId();
		return {
			html: buildMapHtml(mapId, config.height),
			script: createMapScript(
				{ config, layers: renderLayers, ...styleConfig },
				mapId,
			),
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
				detail: "Insert layered mapview widget",
				invoke: "mapview.insertMapView",
			},
			{
				label: "mapview gpx",
				detail: "Insert GPX mapview widget",
				invoke: "mapview.insertMapViewGpx",
			},
			{
				label: "mapview geojson",
				detail: "Insert GeoJSON mapview widget",
				invoke: "mapview.insertMapViewGeoJson",
			},
			{
				label: "mapview markers",
				detail: "Insert marker-only mapview widget",
				invoke: "mapview.insertMapViewMarkers",
			},
		],
	};
}
