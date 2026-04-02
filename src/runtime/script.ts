import { syscall } from "@silverbulletmd/silverbullet/syscall";
import type { RenderPayload } from "../shared/types.ts";
import { editor, events, mq } from "@silverbulletmd/silverbullet/syscalls";
import { MapLibreMap } from "maplibre-gl";
import { normalizeConfig, parseWidgetConfig } from "../config/config";
import { buildRenderLayers } from "..";

type RuntimeDefaults = {
	sourceStyle: {
		fillColor: string;
		fillOpacity: number;
		labelColor: string;
		labelHaloColor: string;
		labelHaloWidth: number;
		labelSize: number;
		lineColor: string;
		lineDasharray: number[];
		lineOpacity: number;
		lineWidth: number;
		pointColor: string;
		pointRadius: number;
		pointStrokeColor: string;
		pointStrokeWidth: number;
	};
	zoom: number;
};

type RuntimeFactories = {
	createFeatureHelpers: () => {
		buildLabelTextExpression: (labelProperty?: string) => unknown[];
		collectGeoJsonLngLats: (geojson: unknown) => [number, number][];
		getFeaturePopupText: (
			feature: unknown,
			popupProperty?: string,
		) => string | null;
	};
	createPopupHelpers: () => {
		buildPopupClassName: (
			marker: Record<string, unknown> | null,
			popupKey: string,
		) => string;
		buildPopupOptions: (
			marker: Record<string, unknown>,
			popupClassName: string,
		) => Record<string, unknown>;
		ensureDefaultPopupStyle: () => void;
	};
	createViewHelpers: () => {
		resolveFitAction: (
			config: {
				autoFit?: boolean;
				center?: [number, number];
				fitPadding?: number;
				zoom?: number;
			},
			fitPoints: [number, number][],
			defaultZoom: number,
		) =>
			| { kind: "noop"; }
			| { kind: "jumpTo"; center: [number, number]; zoom: number; }
			| { kind: "fitBounds"; padding: number; };
		resolveInitialView: (config: {
			center?: [number, number];
			zoom?: number;
		}) => {
			hasExplicitCenter: boolean;
			initialCenter: [number, number];
			initialZoom: number;
		};
		toLngLat: (lat: number, lon: number) => [number, number];
	};
};

type MapLibrePopupInstance = {
	addTo: (map: unknown) => void;
	setLngLat: (lngLat: unknown) => MapLibrePopupInstance;
	setText: (text: string) => MapLibrePopupInstance;
};

type MapLibreMarkerInstance = {
	addTo: (map: unknown) => void;
	remove: () => void;
	setLngLat: (coords: [number, number]) => MapLibreMarkerInstance;
	setPopup: (popup: unknown) => MapLibreMarkerInstance;
};

type MapLibreBoundsInstance = {
	extend: (point: [number, number]) => MapLibreBoundsInstance;
};

type MapLibreMapInstance = {
	addImage: (
		id: string,
		image: HTMLCanvasElement | ImageData,
		options?: Record<string, unknown>,
	) => void;
	addLayer: (layer: Record<string, unknown>) => void;
	addSource: (id: string, source: Record<string, unknown>) => void;
	easeTo: (options: Record<string, unknown>) => void;
	fitBounds: (
		bounds: MapLibreBoundsInstance,
		options: Record<string, unknown>,
	) => void;
	getCanvas: () => { style: { cursor: string; }; };
	hasImage?: (id: string) => boolean;
	jumpTo: (options: Record<string, unknown>) => void;
	off: (eventName: string, handler: (event: unknown) => void) => void;
	on: {
		(eventName: string, handler: (event: unknown) => void): void;
		(
			eventName: string,
			layerId: string,
			handler: (event: unknown) => void,
		): void;
	};
	once: (eventName: string, handler: () => void) => void;
	remove: () => void;
	removeLayer: (id: string) => void;
	removeSource: (id: string) => void;
};

type MapLibreApi = {
	LngLatBounds: new (
		sw: [number, number],
		ne: [number, number],
	) => MapLibreBoundsInstance;
	Map: new (options: Record<string, unknown>) => MapLibreMap;
	Marker: new (options: Record<string, unknown>) => MapLibreMarkerInstance;
	Popup: new (options: Record<string, unknown>) => MapLibrePopupInstance;
};

export function runMapView(
	mapId: string,
	payload: RenderPayload,
	defaults: RuntimeDefaults,
	maplibregl: MapLibreApi,
	runtimeFactories: RuntimeFactories,
	onMapReady?: (map: MapLibreMapInstance) => void,
): void {
	const mapStoreKey = "__mapviewInstances";
	const featureHelpers = runtimeFactories.createFeatureHelpers();
	const popupHelpers = runtimeFactories.createPopupHelpers();
	const viewHelpers = runtimeFactories.createViewHelpers();

	function renderError(message: string): void {
		const element = document.getElementById(mapId);
		if (!element) {
			return;
		}

		element.outerHTML =
			'<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">' +
			message
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;") +
			"</pre>";
	}

	function buildMarkerOptions(
		marker: Record<string, unknown>,
	): Record<string, unknown> {
		const options: Record<string, unknown> = {};
		if (typeof marker.color === "string" && marker.color) {
			options.color = marker.color;
		}
		if (typeof marker.scale === "number") {
			options.scale = marker.scale;
		}
		return options;
	}

	function resolvedSourceStyle(
		style: Record<string, unknown> | undefined,
	): RuntimeDefaults["sourceStyle"] {
		return {
			lineColor:
				style && typeof style.lineColor === "string"
					? style.lineColor
					: defaults.sourceStyle.lineColor,
			lineWidth:
				style && typeof style.lineWidth === "number"
					? style.lineWidth
					: defaults.sourceStyle.lineWidth,
			lineOpacity:
				style && typeof style.lineOpacity === "number"
					? style.lineOpacity
					: defaults.sourceStyle.lineOpacity,
			lineDasharray:
				style &&
					Array.isArray(style.lineDasharray) &&
					style.lineDasharray.every((item) => typeof item === "number")
					? (style.lineDasharray as number[])
					: defaults.sourceStyle.lineDasharray,
			fillColor:
				style && typeof style.fillColor === "string"
					? style.fillColor
					: defaults.sourceStyle.fillColor,
			fillOpacity:
				style && typeof style.fillOpacity === "number"
					? style.fillOpacity
					: defaults.sourceStyle.fillOpacity,
			pointColor:
				style && typeof style.pointColor === "string"
					? style.pointColor
					: defaults.sourceStyle.pointColor,
			pointRadius:
				style && typeof style.pointRadius === "number"
					? style.pointRadius
					: defaults.sourceStyle.pointRadius,
			pointStrokeColor:
				style && typeof style.pointStrokeColor === "string"
					? style.pointStrokeColor
					: defaults.sourceStyle.pointStrokeColor,
			pointStrokeWidth:
				style && typeof style.pointStrokeWidth === "number"
					? style.pointStrokeWidth
					: defaults.sourceStyle.pointStrokeWidth,
			labelColor:
				style && typeof style.labelColor === "string"
					? style.labelColor
					: defaults.sourceStyle.labelColor,
			labelHaloColor:
				style && typeof style.labelHaloColor === "string"
					? style.labelHaloColor
					: defaults.sourceStyle.labelHaloColor,
			labelHaloWidth:
				style && typeof style.labelHaloWidth === "number"
					? style.labelHaloWidth
					: defaults.sourceStyle.labelHaloWidth,
			labelSize:
				style && typeof style.labelSize === "number"
					? style.labelSize
					: defaults.sourceStyle.labelSize,
		};
	}

	function ensureGpxChevronImage(
		map: MapLibreMapInstance,
		color: string,
	): string | null {
		const imageId = `mapview-gpx-chevron-${color
			.toLowerCase()
			.replace(/[^a-z0-9_-]+/g, "-")
			.replace(/^-+|-+$/g, "") || "default"
			}`;
		if (typeof map.hasImage === "function" && map.hasImage(imageId)) {
			return imageId;
		}

		const canvas = document.createElement("canvas");
		const logicalSize = 24;
		const pixelRatio = 2;
		canvas.width = logicalSize * pixelRatio;
		canvas.height = logicalSize * pixelRatio;

		const context = canvas.getContext("2d");
		if (!context) {
			return null;
		}

		context.scale(pixelRatio, pixelRatio);
		context.lineCap = "round";
		context.lineJoin = "round";

		const drawChevron = (strokeStyle: string, lineWidth: number) => {
			context.beginPath();
			context.moveTo(8, 6);
			context.lineTo(16, 12);
			context.lineTo(8, 18);
			context.strokeStyle = strokeStyle;
			context.lineWidth = lineWidth;
			context.stroke();
		};

		drawChevron("rgba(0, 0, 0, 0.92)", 5);
		drawChevron(color, 2);

		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		map.addImage(imageId, imageData, { pixelRatio });
		return imageId;
	}

	function tryAddGpxDirectionLayer(
		map: MapLibreMapInstance,
		sourceId: string,
		layerPrefix: string,
		style: Record<string, unknown> | undefined,
		onLayerAdded?: (id: string) => void,
	): void {
		const sourceStyle = resolvedSourceStyle(style);
		const imageId = ensureGpxChevronImage(map, sourceStyle.lineColor);
		if (!imageId) {
			return;
		}

		try {
			const directionLayerId = `${layerPrefix}-direction`;
			map.addLayer({
				id: directionLayerId,
				type: "symbol",
				source: sourceId,
				filter: ["==", ["geometry-type"], "LineString"],
				layout: {
					"symbol-placement": "line",
					"symbol-spacing": 160,
					"icon-image": imageId,
					"icon-size": 1,
					"icon-keep-upright": false,
					"icon-allow-overlap": true,
					"icon-ignore-placement": true,
					"icon-rotation-alignment": "map",
					"icon-pitch-alignment": "map",
				},
			});
			onLayerAdded?.(directionLayerId);
		} catch (error) {
			console.warn(
				"mapview: unable to add GPX direction chevrons; rendering track without direction layer.",
				error,
			);
		}
	}

	function addMarkers(
		maplibregl: MapLibreApi,
		map: MapLibreMapInstance,
		markers: Record<string, unknown>[],
		fitPoints: [number, number][],
		markerStore: { remove: () => void; }[],
		markerGroupKey: string,
	): void {
		markers.forEach((marker, index) => {
			const instance = new maplibregl.Marker(
				buildMarkerOptions(marker),
			) as MapLibreMarkerInstance;
			instance.setLngLat(
				viewHelpers.toLngLat(marker.lat as number, marker.lon as number),
			);

			if (marker.popup || marker.label) {
				const popupClassName = popupHelpers.buildPopupClassName(
					marker,
					`${markerGroupKey}-${index}`,
				);
				instance.setPopup(
					new maplibregl.Popup(
						popupHelpers.buildPopupOptions(marker, popupClassName),
					).setText(String(marker.popup || marker.label)),
				);
			}

			instance.addTo(map);
			markerStore.push(instance);
			fitPoints.push(
				viewHelpers.toLngLat(marker.lat as number, marker.lon as number),
			);
		});
	}

	function registerPopupHandler(
		maplibregl: MapLibreApi,
		map: MapLibreMapInstance,
		layerId: string,
		popupProperty?: string,
	): void {
		map.on("click", layerId, (event) => {
			const typedEvent = event as { features?: unknown[]; lngLat?: unknown; };
			const feature =
				Array.isArray(typedEvent.features) && typedEvent.features.length > 0
					? typedEvent.features[0]
					: null;
			const popupText = featureHelpers.getFeaturePopupText(
				feature,
				popupProperty,
			);
			if (!popupText) {
				return;
			}

			new maplibregl.Popup({
				offset: 12,
				className: popupHelpers.buildPopupClassName(null, layerId),
			})
				.setLngLat(typedEvent.lngLat)
				.setText(popupText)
				.addTo(map);
		});

		map.on("mouseenter", layerId, () => {
			map.getCanvas().style.cursor = "pointer";
		});

		map.on("mouseleave", layerId, () => {
			map.getCanvas().style.cursor = "";
		});
	}

	function addGeoJsonLayers(
		maplibregl: MapLibreApi,
		map: MapLibreMapInstance,
		sourceId: string,
		data: unknown,
		layerPrefix: string,
		fitPoints: [number, number][],
		style: Record<string, unknown> | undefined,
		layerConfig: {
			labelProperty?: string;
			popupProperty?: string;
			showDirection?: boolean;
			showLabels?: boolean;
		},
		onLayerAdded?: (id: string) => void,
		onSourceAdded?: (id: string) => void,
	): void {
		const coordinates = featureHelpers.collectGeoJsonLngLats(data);
		if (coordinates.length === 0) {
			throw new Error("GeoJSON Error: No renderable features found.");
		}

		const sourceStyle = resolvedSourceStyle(style);
		map.addSource(sourceId, {
			type: "geojson",
			data,
		});
		onSourceAdded?.(sourceId);

		const fillLayerId = `${layerPrefix}-fill`;
		const lineLayerId = `${layerPrefix}-line`;
		const pointLayerId = `${layerPrefix}-point`;

		map.addLayer({
			id: fillLayerId,
			type: "fill",
			source: sourceId,
			filter: ["==", ["geometry-type"], "Polygon"],
			paint: {
				"fill-color": sourceStyle.fillColor,
				"fill-opacity": sourceStyle.fillOpacity,
			},
		});
		onLayerAdded?.(fillLayerId);

		const linePaint: Record<string, unknown> = {
			"line-color": sourceStyle.lineColor,
			"line-width": sourceStyle.lineWidth,
			"line-opacity": sourceStyle.lineOpacity,
		};
		if (sourceStyle.lineDasharray.length > 0) {
			linePaint["line-dasharray"] = sourceStyle.lineDasharray;
		}

		map.addLayer({
			id: lineLayerId,
			type: "line",
			source: sourceId,
			paint: linePaint,
		});
		onLayerAdded?.(lineLayerId);

		if (layerConfig.showDirection) {
			tryAddGpxDirectionLayer(map, sourceId, layerPrefix, style, onLayerAdded);
		}

		map.addLayer({
			id: pointLayerId,
			type: "circle",
			source: sourceId,
			filter: ["==", ["geometry-type"], "Point"],
			paint: {
				"circle-radius": sourceStyle.pointRadius,
				"circle-color": sourceStyle.pointColor,
				"circle-stroke-color": sourceStyle.pointStrokeColor,
				"circle-stroke-width": sourceStyle.pointStrokeWidth,
			},
		});
		onLayerAdded?.(pointLayerId);

		if (layerConfig.showLabels || layerConfig.labelProperty) {
			const labelsLayerId = `${layerPrefix}-labels`;
			map.addLayer({
				id: labelsLayerId,
				type: "symbol",
				source: sourceId,
				filter: ["==", ["geometry-type"], "Point"],
				layout: {
					"text-field": featureHelpers.buildLabelTextExpression(
						layerConfig.labelProperty,
					),
					"text-size": sourceStyle.labelSize,
					"text-offset": [0, 1.1],
					"text-anchor": "top",
				},
				paint: {
					"text-color": sourceStyle.labelColor,
					"text-halo-color": sourceStyle.labelHaloColor,
					"text-halo-width": sourceStyle.labelHaloWidth,
				},
			});
			onLayerAdded?.(labelsLayerId);
		}

		registerPopupHandler(
			maplibregl,
			map,
			fillLayerId,
			layerConfig.popupProperty,
		);
		registerPopupHandler(
			maplibregl,
			map,
			lineLayerId,
			layerConfig.popupProperty,
		);
		registerPopupHandler(
			maplibregl,
			map,
			pointLayerId,
			layerConfig.popupProperty,
		);

		coordinates.forEach((coordinate) => {
			fitPoints.push(coordinate);
		});
	}

	function cleanupExistingInstance(): void {
		if (!(mapStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[mapStoreKey] = {};
		}

		const instances =
			((globalThis as unknown as Record<string, unknown>)[mapStoreKey] as
				| Record<
					string,
					{ map?: { remove: () => void; }; markers?: { remove: () => void; }[]; }
				>
				| undefined) ?? {};
		const existing = instances[mapId];
		if (!existing) {
			return;
		}

		(existing.markers || []).forEach((marker) => {
			marker.remove();
		});
		existing.map?.remove();
		delete instances[mapId];
	}

	function initMap(maplibregl: MapLibreApi): void {
		const element = document.getElementById(mapId);
		if (!element) {
			return;
		}

		cleanupExistingInstance();
		popupHelpers.ensureDefaultPopupStyle();

		const initialView = viewHelpers.resolveInitialView(payload.config);
		const map = new maplibregl.Map({
			container: mapId,
			style: payload.styleUrl,
			center: initialView.initialCenter,
			zoom: initialView.initialZoom,
		});

		// syscall("editor.getCurrentPath").then(console.log);

		type MapViewEventDetail =
			(| {
				type: "focus",
				center: [number, number];
				zoom: number;
				duration?: number;
			}
				| {
					type: "updateConfig",
					config: string,
				}) & {
					mapId: string;
				};

		const mapviewEventHandler = (event: CustomEvent<MapViewEventDetail>) => {

			// const typedEvent = event;
			if ((event.detail.mapId !== mapId) && !(!event.detail.mapId && mapId === "mapview-sidebar")) {
				return;
			}
			console.log("Received mapview event with data:", event);
			editor.flashNotification("Map view event received!");

			switch (event.detail.type) {

				case "focus":
					(map).easeTo({
						center: event.detail.center,
						zoom: event.detail.zoom,
						duration: event.detail.duration ?? 1000
					});
					break;
				case "updateConfig":
					try {
						buildRenderLayers(event.detail.config).then(layers => {

							updateMapViewLayers(mapId, layers);
						}).catch((error) => {
							const message =
								error instanceof Error ? error.message : "Unknown error building render layers.";
							renderError(`Map Error: ${message}`);
						});
					} catch (error) {
						const message =
							error instanceof Error ? error.message : "Unknown error updating map config.";
						renderError(`Map Error: ${message}`);
					}
					break;
				default:
					break;
			}
		};

		window.parent.document.addEventListener("mapview", mapviewEventHandler);
		editor.getCursor().then(cursor => {

			editor.flashNotification(`cursor info: ${cursor}`);
		});

		const markerStore: { remove: () => void; }[] = [];
		const trackedLayerIds: string[] = [];
		const trackedSourceIds: string[] = [];
		const mapInstances =
			((globalThis as Record<string, unknown>)[mapStoreKey] as
				| Record<string, unknown>
				| undefined) ?? {};
		mapInstances[mapId] = { map, markers: markerStore };
		(globalThis as Record<string, unknown>)[mapStoreKey] = mapInstances;

		function doAddLayers(
			layers: RenderPayload["layers"],
			fitPoints: [number, number][],
		): void {
			const trackLayer = (id: string) => trackedLayerIds.push(id);
			const trackSource = (id: string) => trackedSourceIds.push(id);

			layers.forEach((layer, index) => {
				if (layer.kind === "markers") {
					addMarkers(
						maplibregl,
						map,
						layer.markers as Record<string, unknown>[],
						fitPoints,
						markerStore,
						layer.id || `${mapId}-markers-${index}`,
					);
					return;
				}

				if (layer.sourceData.kind === "gpx") {
					if (layer.sourceData.trackGeoJson) {
						addGeoJsonLayers(
							maplibregl,
							map,
							`${mapId}-gpx-source-${index}`,
							layer.sourceData.trackGeoJson,
							layer.id || `${mapId}-gpx-${index}`,
							fitPoints,
							layer.sourceData.style,
							{
								popupProperty: layer.popupProperty,
								showDirection: layer.showDirection,
								showLabels: layer.showLabels,
								labelProperty: layer.labelProperty,
							},
							trackLayer,
							trackSource,
						);
					}

					addMarkers(
						maplibregl,
						map,
						layer.sourceData.markers as Record<string, unknown>[],
						fitPoints,
						markerStore,
						layer.id || `${mapId}-gpx-markers-${index}`,
					);
					return;
				}

				addGeoJsonLayers(
					maplibregl,
					map,
					`${mapId}-geojson-source-${index}`,
					layer.sourceData.data,
					layer.id || `${mapId}-geojson-${index}`,
					fitPoints,
					layer.sourceData.style,
					{
						popupProperty: layer.popupProperty,
						showLabels: layer.showLabels,
						labelProperty: layer.labelProperty,
					},
					trackLayer,
					trackSource,
				);
			});
		}

		function renderLayers(newLayers: RenderPayload["layers"]): void {
			[...trackedLayerIds].reverse().forEach((id) => {
				try { map.removeLayer(id); } catch { /* layer may not exist */ }
			});
			trackedLayerIds.length = 0;
			trackedSourceIds.forEach((id) => {
				try { map.removeSource(id); } catch { /* source may not exist */ }
			});
			trackedSourceIds.length = 0;
			markerStore.forEach((m) => m.remove());
			markerStore.length = 0;

			doAddLayers(newLayers, []);
		}

		(mapInstances[mapId] as Record<string, unknown>).renderLayers = renderLayers;

		let initialized = false;
		const initialErrorHandler = (event: unknown) => {
			if (initialized) {
				return;
			}

			const typedEvent = event as { error?: { message?: string; }; };
			const message = typedEvent.error?.message
				? typedEvent.error.message
				: "Unable to load MapLibre style.";
			renderError(`Map Error: ${message}`);
			cleanupExistingInstance();
		};

		map.on("error", initialErrorHandler);
		(map as MapLibreMap).on("remove", () => {
			window.parent.document.removeEventListener("mapview", mapviewEventHandler);
		});
		map.once("load", () => {
			initialized = true;
			map.off("error", initialErrorHandler);

			try {
				const fitPoints: [number, number][] = [];
				doAddLayers(payload.layers, fitPoints);

				const fitAction = viewHelpers.resolveFitAction(
					payload.config,
					fitPoints,
					defaults.zoom,
				);
				if (fitAction.kind === "jumpTo") {
					map.jumpTo({
						center: fitAction.center,
						zoom: fitAction.zoom,
					});
				} else if (fitAction.kind === "fitBounds") {
					const firstPoint = fitPoints[0];
					if (firstPoint) {
						const bounds = fitPoints.reduce(
							(accumulator, point) => accumulator.extend(point),
							new maplibregl.LngLatBounds(firstPoint, firstPoint),
						);
						map.fitBounds(bounds, {
							padding: fitAction.padding,
							duration: 0,
						});
					}
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unable to render map data.";
				renderError(`Map Error: ${message}`);
				cleanupExistingInstance();
				return;
			}

			onMapReady?.(map);
		});
	}

	initMap(maplibregl);
}

export function updateMapViewLayers(
	mapId: string,
	newLayers: RenderPayload["layers"],
): void {
	const mapStoreKey = "__mapviewInstances";
	const instances = (globalThis as Record<string, unknown>)[mapStoreKey] as
		| Record<string, { renderLayers?: (layers: RenderPayload["layers"]) => void; }>
		| undefined;
	instances?.[mapId]?.renderLayers?.(newLayers);
}
