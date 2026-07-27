import {
	clientStore,
	editor,
	config as globalConfig,
} from "@silverbulletmd/silverbullet/syscalls";
import { normalizeConfig, parseWidgetConfig } from "./config/config.ts";
import { DEFAULT_STYLE_URL } from "./config/constants.ts";
import { createMapScript } from "./runtime/index.ts";
import type {
	LayerConfig,
	RenderFileLayer,
	RenderLayer,
	RenderPayload,
	WidgetRenderResult,
} from "./shared/types.ts";
import {
	asString,
	buildError,
	createMapId,
	escapeHtml,
} from "./shared/utils.ts";
import {
	buildSidebarPlaceholderHtml,
	findActiveMapViewWidget,
	SIDEBAR_HEIGHT,
	SIDEBAR_MAP_ID,
} from "./sidebar/controller.ts";
import { loadSourceData } from "./sources/index.ts";

const STARTER_BLOCK = `\`\`\`mapview
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
\`\`\``;

let configSchemaRegistration: Promise<void> | undefined;

export async function insertMapView(): Promise<void> {
	const selection = await editor.getSelection();
	const { from, to } = selection;
	await editor.replaceRange(from, to, STARTER_BLOCK);
}

async function ensureConfigSchemaDefined(): Promise<void> {
	if (!configSchemaRegistration) {
		configSchemaRegistration = globalConfig
			.define("mapview.styleUrl", {
				type: "string",
				default: DEFAULT_STYLE_URL,
				description: "MapLibre style URL used by mapview.",
			})
			.then(() => undefined);
	}

	await configSchemaRegistration;
}

async function loadSpaceConfig(widgetStyleUrl?: string): Promise<{
	styleUrl: string;
}> {
	await ensureConfigSchemaDefined();

	const styleUrl = widgetStyleUrl
		? widgetStyleUrl
		: asString(await globalConfig.get("mapview.styleUrl", DEFAULT_STYLE_URL)) ||
			DEFAULT_STYLE_URL;

	return { styleUrl };
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

export async function buildRenderLayers(
	widgetBody: string,
): Promise<RenderLayer[]> {
	const config = normalizeConfig(parseWidgetConfig(widgetBody));
	const visibleLayers = config.layers.filter((layer) => layer.visible);
	return Promise.all(visibleLayers.map(buildRenderLayer));
}

export async function buildRenderPayload(
	widgetBody: string,
): Promise<RenderPayload> {
	const config = normalizeConfig(parseWidgetConfig(widgetBody));
	const visibleLayers = config.layers.filter((layer) => layer.visible);
	const layers = await Promise.all(visibleLayers.map(buildRenderLayer));
	const styleConfig = await loadSpaceConfig(config.styleUrl);
	return {
		config,
		layers,
		...styleConfig,
	};
}

export async function renderMapViewWidget(
	widgetBody: string,
): Promise<WidgetRenderResult> {
	try {
		const payload = await buildRenderPayload(widgetBody);

		if (payload.layers.length === 0 && !payload.config.center) {
			return buildError(
				"Map Error: Provide at least one visible layer or a center coordinate.",
			);
		}

		const mapId = createMapId();
		return {
			html: buildMapHtml(mapId, payload.config.height),
			script: createMapScript(payload, mapId),
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
		],
	};
}

const STATE_KEY = "mapview_sidebar_visible";

const isSidebarVisible = async () => !!(await clientStore.get(STATE_KEY));

async function buildSidebarRenderResult(): Promise<WidgetRenderResult> {
	const documentText = await editor.getText();
	const cursor = await editor.getCursor();
	const widgetBody = findActiveMapViewWidget(documentText, cursor);

	if (!widgetBody) {
		return {
			html: buildSidebarPlaceholderHtml(),
			script: "",
		};
	}

	try {
		const payload = await buildRenderPayload(widgetBody);
		return {
			html: buildMapHtml(SIDEBAR_MAP_ID, SIDEBAR_HEIGHT),
			script: createMapScript(
				{
					...payload,
					config: {
						...payload.config,
						height: SIDEBAR_HEIGHT,
					},
				},
				SIDEBAR_MAP_ID,
			),
		};
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unknown sidebar rendering error.";
		return buildError(message);
	}
}

export async function refreshMapViewSidebar(): Promise<void> {
	const result = await buildSidebarRenderResult();
	await editor.showPanel("rhs", 1, result.html, result.script);
}

export async function enableMapViewSidebar(force = false): Promise<void> {
	if ((await isSidebarVisible()) && !force) {
		return;
	}

	await clientStore.set(STATE_KEY, true);
	await refreshMapViewSidebar();
}

export async function disableMapViewSidebar(): Promise<void> {
	if (!(await isSidebarVisible())) {
		return;
	}

	await clientStore.set(STATE_KEY, false);
	await editor.hidePanel("rhs");
}

export async function toggleMapViewSidebar(): Promise<void> {
	if (await isSidebarVisible()) {
		await disableMapViewSidebar();
		return;
	}

	await enableMapViewSidebar();
}

export async function initMapViewSidebar(): Promise<void> {
	if (await isSidebarVisible()) {
		await refreshMapViewSidebar();
	}
}
