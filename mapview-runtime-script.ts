import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "./mapview-constants.ts";
import type { RenderPayload } from "./mapview-types.ts";

type RuntimeDefaults = {
	sourceStyle: typeof DEFAULT_SOURCE_STYLE;
	zoom: typeof DEFAULT_ZOOM;
};

export function runMapView(
	mapId: string,
	payload: RenderPayload,
	defaults: RuntimeDefaults = {
		sourceStyle: DEFAULT_SOURCE_STYLE,
		zoom: DEFAULT_ZOOM,
	},
): void {
	const loaderStoreKey = "__mapviewMapLibreLoaders";
	const loadedVersionKey = "__mapviewLoadedMapLibreVersion";
	const mapStoreKey = "__mapviewInstances";
	const popupStyleStoreKey = "__mapviewPopupStyles";
	const maplibreVersion = payload.maplibreVersion;
	const maplibreVersionKey = encodeURIComponent(String(maplibreVersion));
	const cssHref =
		"https://unpkg.com/maplibre-gl@" +
		maplibreVersion +
		"/dist/maplibre-gl.css";
	const scriptSrc =
		"https://unpkg.com/maplibre-gl@" + maplibreVersion + "/dist/maplibre-gl.js";
	const defaultSourceStyle = defaults.sourceStyle;
	const defaultPopupClassName = "mapview-popup-default";

	function getLoaderStore(): Record<string, Promise<unknown>> {
		if (!(loaderStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[loaderStoreKey] = {};
		}

		return (globalThis as Record<string, Record<string, Promise<unknown>>>)[
			loaderStoreKey
		];
	}

	function getMapLibreVersionError(activeVersion: string): Error {
		return new Error(
			`MapLibre GL JS ${activeVersion} is already active on this page. mapview supports only one MapLibre version per page.`,
		);
	}

	function findVersionedAsset(tagName: string): Element | null {
		return document.querySelector(
			`${tagName}[data-mapview-maplibre-version="${maplibreVersionKey}"]`,
		);
	}

	function loadMapLibre(): Promise<unknown> {
		const loaders = getLoaderStore();
		if (loaders[maplibreVersion]) {
			return loaders[maplibreVersion];
		}

		const activeVersions = Object.keys(loaders).filter(
			(version) => version !== maplibreVersion,
		);
		if (activeVersions.length > 0) {
			return Promise.reject(getMapLibreVersionError(activeVersions[0]));
		}

		const loadedVersion = (globalThis as Record<string, unknown>)[
			loadedVersionKey
		];
		if (
			typeof loadedVersion === "string" &&
			loadedVersion &&
			loadedVersion !== maplibreVersion &&
			"maplibregl" in globalThis
		) {
			return Promise.reject(getMapLibreVersionError(loadedVersion));
		}

		loaders[maplibreVersion] = new Promise((resolve, reject) => {
			const existingStylesheet = findVersionedAsset("link");
			if (!existingStylesheet) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = cssHref;
				link.setAttribute("data-mapview-maplibre-version", maplibreVersionKey);
				document.head.appendChild(link);
			}

			if (
				"maplibregl" in globalThis &&
				(globalThis as Record<string, unknown>)[loadedVersionKey] ===
					maplibreVersion
			) {
				resolve((globalThis as Record<string, unknown>).maplibregl);
				return;
			}

			let script = findVersionedAsset("script");
			if (script?.getAttribute("data-mapview-status") === "error") {
				script.remove();
				script = null;
			}

			const handleLoad = () => {
				const targetScript = findVersionedAsset("script");
				if (targetScript) {
					targetScript.setAttribute("data-mapview-status", "loaded");
				}

				if (!("maplibregl" in globalThis)) {
					handleError();
					return;
				}

				(globalThis as Record<string, unknown>)[loadedVersionKey] =
					maplibreVersion;
				resolve((globalThis as Record<string, unknown>).maplibregl);
			};

			const handleError = () => {
				const targetScript = findVersionedAsset("script");
				if (targetScript) {
					targetScript.setAttribute("data-mapview-status", "error");
					targetScript.remove();
				}

				reject(new Error(`Failed to load MapLibre GL JS ${maplibreVersion}.`));
			};

			if (script) {
				if (
					script.getAttribute("data-mapview-status") === "loaded" &&
					"maplibregl" in globalThis
				) {
					(globalThis as Record<string, unknown>)[loadedVersionKey] =
						maplibreVersion;
					resolve((globalThis as Record<string, unknown>).maplibregl);
					return;
				}

				script.addEventListener("load", handleLoad, { once: true });
				script.addEventListener("error", handleError, { once: true });
				return;
			}

			script = document.createElement("script");
			script.src = scriptSrc;
			script.setAttribute("data-mapview-maplibre-version", maplibreVersionKey);
			script.setAttribute("data-mapview-status", "loading");
			script.addEventListener("load", handleLoad, { once: true });
			script.addEventListener("error", handleError, { once: true });
			document.head.appendChild(script);
		}).catch((error) => {
			delete loaders[maplibreVersion];
			throw error;
		});

		return loaders[maplibreVersion];
	}

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

	function toLngLat(lat: number, lon: number): [number, number] {
		return [lon, lat];
	}

	function sanitizeCssValue(value: unknown): string {
		return String(value || "").replace(/[;{}\\]/g, "");
	}

	function sanitizeClassSegment(value: unknown): string {
		return String(value || "")
			.toLowerCase()
			.replace(/[^a-z0-9_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function ensurePopupStyleStore(): {
		element: HTMLStyleElement | null;
		rules: Record<string, boolean>;
	} {
		if (!(popupStyleStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[popupStyleStoreKey] = {
				element: null,
				rules: {},
			};
		}

		const store = (
			globalThis as Record<
				string,
				{ element: HTMLStyleElement | null; rules: Record<string, boolean> }
			>
		)[popupStyleStoreKey];
		if (!store.element || !store.element.isConnected) {
			const style = document.createElement("style");
			style.setAttribute("data-mapview-popup-styles", "true");
			document.head.appendChild(style);
			store.element = style;
		}

		return store;
	}

	function appendPopupStyleRule(
		className: string,
		popupStyle?: {
			backgroundColor?: string;
			textColor?: string;
			borderColor?: string;
		},
	): void {
		if (!className) {
			return;
		}

		const store = ensurePopupStyleStore();
		if (store.rules[className]) {
			return;
		}

		const backgroundColor = sanitizeCssValue(
			popupStyle?.backgroundColor ? popupStyle.backgroundColor : "Canvas",
		);
		const textColor = sanitizeCssValue(
			popupStyle?.textColor ? popupStyle.textColor : "CanvasText",
		);
		const borderColor = sanitizeCssValue(
			popupStyle?.borderColor ? popupStyle.borderColor : backgroundColor,
		);

		store.element?.appendChild(
			document.createTextNode(
				`.maplibregl-popup.${className} .maplibregl-popup-content {` +
					`background:${backgroundColor};` +
					`color:${textColor};` +
					`border:1px solid ${borderColor};` +
					"box-shadow:0 10px 28px rgba(0, 0, 0, 0.18);" +
					"}" +
					`.maplibregl-popup.${className} .maplibregl-popup-close-button {` +
					`color:${textColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-top.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-top-left.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-top-right.${className} .maplibregl-popup-tip {` +
					`border-bottom-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom-left.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom-right.${className} .maplibregl-popup-tip {` +
					`border-top-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-left.${className} .maplibregl-popup-tip {` +
					`border-right-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-right.${className} .maplibregl-popup-tip {` +
					`border-left-color:${backgroundColor};` +
					"}",
			),
		);
		store.rules[className] = true;
	}

	function ensureDefaultPopupStyle(): void {
		appendPopupStyleRule(defaultPopupClassName, {
			backgroundColor: "Canvas",
			textColor: "CanvasText",
		});
	}

	function extractFeaturePopupText(feature: unknown): string | null {
		const props =
			feature &&
			typeof feature === "object" &&
			"properties" in feature &&
			feature.properties &&
			typeof feature.properties === "object"
				? (feature.properties as Record<string, unknown>)
				: null;

		if (!props) {
			return null;
		}

		return typeof props.popup === "string"
			? props.popup
			: typeof props.name === "string"
				? props.name
				: null;
	}

	function collectLngLatCoordinates(
		input: unknown,
		bucket: [number, number][],
	): void {
		if (!Array.isArray(input)) {
			return;
		}

		if (
			input.length >= 2 &&
			typeof input[0] === "number" &&
			typeof input[1] === "number"
		) {
			bucket.push([input[0], input[1]]);
			return;
		}

		input.forEach((item) => collectLngLatCoordinates(item, bucket));
	}

	function collectGeoJsonLngLats(geojson: unknown): [number, number][] {
		const points: [number, number][] = [];

		function visit(node: unknown): void {
			if (!node || typeof node !== "object") {
				return;
			}

			const typedNode = node as Record<string, unknown>;
			switch (typedNode.type) {
				case "FeatureCollection":
					(Array.isArray(typedNode.features) ? typedNode.features : []).forEach(
						visit,
					);
					return;
				case "Feature":
					visit(typedNode.geometry);
					return;
				case "GeometryCollection":
					(Array.isArray(typedNode.geometries)
						? typedNode.geometries
						: []
					).forEach(visit);
					return;
				case "Point":
				case "MultiPoint":
				case "LineString":
				case "MultiLineString":
				case "Polygon":
				case "MultiPolygon":
					collectLngLatCoordinates(typedNode.coordinates, points);
					return;
			}
		}

		visit(geojson);
		return points;
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

	function buildPopupClassName(
		marker: Record<string, unknown> | null,
		popupKey: string,
	): string {
		ensureDefaultPopupStyle();

		const classNames = [defaultPopupClassName];
		if (
			marker &&
			typeof marker.popupClassName === "string" &&
			marker.popupClassName
		) {
			classNames.push(marker.popupClassName);
		}

		if (
			marker &&
			(marker.popupBackgroundColor ||
				marker.popupTextColor ||
				marker.popupBorderColor)
		) {
			const generatedClassName =
				"mapview-popup-" + sanitizeClassSegment(popupKey);
			appendPopupStyleRule(generatedClassName, {
				backgroundColor:
					typeof marker.popupBackgroundColor === "string"
						? marker.popupBackgroundColor
						: undefined,
				textColor:
					typeof marker.popupTextColor === "string"
						? marker.popupTextColor
						: undefined,
				borderColor:
					typeof marker.popupBorderColor === "string"
						? marker.popupBorderColor
						: undefined,
			});
			classNames.push(generatedClassName);
		}

		return classNames.join(" ");
	}

	function buildPopupOptions(
		marker: Record<string, unknown>,
		popupClassName: string,
	): Record<string, unknown> {
		const options: Record<string, unknown> = {
			offset: 25,
			className: popupClassName,
		};

		if (typeof marker.popupMaxWidth === "string" && marker.popupMaxWidth) {
			options.maxWidth = marker.popupMaxWidth;
		}

		return options;
	}

	function addMarker(
		maplibregl: {
			Marker: new (
				options: Record<string, unknown>,
			) => {
				setLngLat: (coords: [number, number]) => unknown;
				setPopup: (popup: unknown) => unknown;
				addTo: (map: unknown) => void;
				remove: () => void;
			};
			Popup: new (
				options: Record<string, unknown>,
			) => {
				setText: (text: string) => unknown;
			};
		},
		map: unknown,
		markers: Record<string, unknown>[],
		fitPoints: [number, number][],
		markerStore: { remove: () => void }[],
		markerGroupKey: string,
	): void {
		markers.forEach((marker, index) => {
			const instance = new maplibregl.Marker(buildMarkerOptions(marker)) as {
				setLngLat: (coords: [number, number]) => {
					setPopup: (popup: unknown) => {
						addTo: (map: unknown) => void;
						remove: () => void;
					};
					addTo: (map: unknown) => void;
					remove: () => void;
				};
				setPopup: (popup: unknown) => {
					addTo: (map: unknown) => void;
					remove: () => void;
				};
				addTo: (map: unknown) => void;
				remove: () => void;
			};
			instance.setLngLat(toLngLat(marker.lat as number, marker.lon as number));

			if (marker.popup || marker.label) {
				const popupClassName = buildPopupClassName(
					marker,
					`${markerGroupKey}-${index}`,
				);
				instance.setPopup(
					new maplibregl.Popup(
						buildPopupOptions(marker, popupClassName),
					).setText(String(marker.popup || marker.label)),
				);
			}

			instance.addTo(map);
			markerStore.push(instance);
			fitPoints.push(toLngLat(marker.lat as number, marker.lon as number));
		});
	}

	function registerPopupHandler(
		maplibregl: {
			Popup: new (
				options: Record<string, unknown>,
			) => {
				setLngLat: (lngLat: unknown) => {
					setText: (text: string) => { addTo: (map: unknown) => void };
				};
			};
		},
		map: {
			on: (
				eventName: string,
				layerId: string,
				handler: (event: any) => void,
			) => void;
			getCanvas: () => { style: { cursor: string } };
		},
		layerId: string,
	): void {
		map.on("click", layerId, (event) => {
			const feature =
				Array.isArray(event.features) && event.features.length > 0
					? event.features[0]
					: null;
			const popupText = extractFeaturePopupText(feature);
			if (!popupText) {
				return;
			}

			new maplibregl.Popup({
				offset: 12,
				className: buildPopupClassName(null, layerId),
			})
				.setLngLat(event.lngLat)
				.setText(String(popupText))
				.addTo(map);
		});

		map.on("mouseenter", layerId, () => {
			map.getCanvas().style.cursor = "pointer";
		});

		map.on("mouseleave", layerId, () => {
			map.getCanvas().style.cursor = "";
		});
	}

	function resolvedSourceStyle(
		style: Record<string, unknown> | undefined,
	): typeof DEFAULT_SOURCE_STYLE {
		return {
			lineColor:
				style && typeof style.lineColor === "string"
					? style.lineColor
					: defaultSourceStyle.lineColor,
			lineWidth:
				style && typeof style.lineWidth === "number"
					? style.lineWidth
					: defaultSourceStyle.lineWidth,
			lineOpacity:
				style && typeof style.lineOpacity === "number"
					? style.lineOpacity
					: defaultSourceStyle.lineOpacity,
			fillColor:
				style && typeof style.fillColor === "string"
					? style.fillColor
					: defaultSourceStyle.fillColor,
			fillOpacity:
				style && typeof style.fillOpacity === "number"
					? style.fillOpacity
					: defaultSourceStyle.fillOpacity,
			pointColor:
				style && typeof style.pointColor === "string"
					? style.pointColor
					: defaultSourceStyle.pointColor,
			pointRadius:
				style && typeof style.pointRadius === "number"
					? style.pointRadius
					: defaultSourceStyle.pointRadius,
			pointStrokeColor:
				style && typeof style.pointStrokeColor === "string"
					? style.pointStrokeColor
					: defaultSourceStyle.pointStrokeColor,
			pointStrokeWidth:
				style && typeof style.pointStrokeWidth === "number"
					? style.pointStrokeWidth
					: defaultSourceStyle.pointStrokeWidth,
		};
	}

	function addGeoJsonLayers(
		maplibregl: {
			Popup: new (
				options: Record<string, unknown>,
			) => {
				setLngLat: (lngLat: unknown) => {
					setText: (text: string) => { addTo: (map: unknown) => void };
				};
			};
		},
		map: {
			addSource: (id: string, source: Record<string, unknown>) => void;
			addLayer: (layer: Record<string, unknown>) => void;
			on: (
				eventName: string,
				layerId: string,
				handler: (event: any) => void,
			) => void;
			getCanvas: () => { style: { cursor: string } };
		},
		sourceId: string,
		data: unknown,
		layerPrefix: string,
		fitPoints: [number, number][],
		style: Record<string, unknown> | undefined,
	): void {
		const coordinates = collectGeoJsonLngLats(data);
		if (coordinates.length === 0) {
			throw new Error("GeoJSON Error: No renderable features found.");
		}

		const resolvedStyle = resolvedSourceStyle(style);

		map.addSource(sourceId, {
			type: "geojson",
			data,
		});

		const fillLayerId = `${layerPrefix}-fill`;
		const lineLayerId = `${layerPrefix}-line`;
		const pointLayerId = `${layerPrefix}-point`;

		map.addLayer({
			id: fillLayerId,
			type: "fill",
			source: sourceId,
			filter: ["==", ["geometry-type"], "Polygon"],
			paint: {
				"fill-color": resolvedStyle.fillColor,
				"fill-opacity": resolvedStyle.fillOpacity,
			},
		});

		map.addLayer({
			id: lineLayerId,
			type: "line",
			source: sourceId,
			paint: {
				"line-color": resolvedStyle.lineColor,
				"line-width": resolvedStyle.lineWidth,
				"line-opacity": resolvedStyle.lineOpacity,
			},
		});

		map.addLayer({
			id: pointLayerId,
			type: "circle",
			source: sourceId,
			filter: ["==", ["geometry-type"], "Point"],
			paint: {
				"circle-radius": resolvedStyle.pointRadius,
				"circle-color": resolvedStyle.pointColor,
				"circle-stroke-color": resolvedStyle.pointStrokeColor,
				"circle-stroke-width": resolvedStyle.pointStrokeWidth,
			},
		});

		registerPopupHandler(maplibregl, map, fillLayerId);
		registerPopupHandler(maplibregl, map, lineLayerId);
		registerPopupHandler(maplibregl, map, pointLayerId);

		coordinates.forEach((coordinate) => fitPoints.push(coordinate));
	}

	function cleanupExistingInstance(): void {
		if (!(mapStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[mapStoreKey] = {};
		}

		const instances = (
			globalThis as Record<
				string,
				Record<
					string,
					{ map?: { remove: () => void }; markers?: { remove: () => void }[] }
				>
			>
		)[mapStoreKey];
		const existing = instances[mapId];
		if (!existing) {
			return;
		}

		(existing.markers || []).forEach((marker) => marker.remove());
		existing.map?.remove();
		delete instances[mapId];
	}

	function initMap(maplibregl: {
		Map: new (
			options: Record<string, unknown>,
		) => {
			on: (eventName: string, handler: (event: any) => void) => void;
			on: (
				eventName: string,
				layerId: string,
				handler: (event: any) => void,
			) => void;
			once: (eventName: string, handler: () => void) => void;
			off: (eventName: string, handler: (event: any) => void) => void;
			addSource: (id: string, source: Record<string, unknown>) => void;
			addLayer: (layer: Record<string, unknown>) => void;
			getCanvas: () => { style: { cursor: string } };
			remove: () => void;
			jumpTo: (options: Record<string, unknown>) => void;
			fitBounds: (
				bounds: { extend: (point: [number, number]) => unknown },
				options: Record<string, unknown>,
			) => void;
		};
		Marker: new (options: Record<string, unknown>) => any;
		Popup: new (options: Record<string, unknown>) => any;
		LngLatBounds: new (
			sw: [number, number],
			ne: [number, number],
		) => {
			extend: (point: [number, number]) => unknown;
			getSouthWest: () => { lng: number; lat: number };
			getNorthEast: () => { lng: number; lat: number };
		};
	}): void {
		const element = document.getElementById(mapId);
		if (!element) {
			return;
		}

		cleanupExistingInstance();
		ensureDefaultPopupStyle();

		const config = payload.config;
		const hasExplicitCenter = Array.isArray(config.center);
		const initialCenter = hasExplicitCenter
			? toLngLat(config.center[0], config.center[1])
			: [0, 0];
		const initialZoom =
			hasExplicitCenter && typeof config.zoom === "number" ? config.zoom : 1;

		const map = new maplibregl.Map({
			container: mapId,
			style: payload.styleUrl,
			center: initialCenter,
			zoom: initialZoom,
		});

		const markerStore: { remove: () => void }[] = [];
		((globalThis as Record<string, Record<string, unknown>>)[mapStoreKey] ??=
			{})[mapId] = { map, markers: markerStore };

		let initialized = false;
		const initialErrorHandler = (event: { error?: { message?: string } }) => {
			if (initialized) {
				return;
			}

			const message = event?.error?.message
				? event.error.message
				: "Unable to load MapLibre style.";
			renderError(`Map Error: ${message}`);
			cleanupExistingInstance();
		};

		map.on("error", initialErrorHandler);

		map.once("load", () => {
			initialized = true;
			map.off("error", initialErrorHandler);

			try {
				const fitPoints: [number, number][] = [];

				payload.sourceData.forEach((sourceData, index) => {
					if (sourceData.kind === "gpx") {
						if (sourceData.trackGeoJson) {
							addGeoJsonLayers(
								maplibregl,
								map,
								`${mapId}-gpx-source-${index}`,
								sourceData.trackGeoJson,
								`${mapId}-gpx-${index}`,
								fitPoints,
								sourceData.style,
							);
						}

						addMarker(
							maplibregl,
							map,
							sourceData.markers as Record<string, unknown>[],
							fitPoints,
							markerStore,
							`${mapId}-gpx-${index}`,
						);
						return;
					}

					addGeoJsonLayers(
						maplibregl,
						map,
						`${mapId}-geojson-source-${index}`,
						sourceData.data,
						`${mapId}-geojson-${index}`,
						fitPoints,
						sourceData.style,
					);
				});

				addMarker(
					maplibregl,
					map,
					config.markers as Record<string, unknown>[],
					fitPoints,
					markerStore,
					`${mapId}-manual`,
				);

				if (hasExplicitCenter) {
					map.jumpTo({
						center: toLngLat(config.center[0], config.center[1]),
						zoom: typeof config.zoom === "number" ? config.zoom : defaults.zoom,
					});
					return;
				}

				if (!config.autoFit || fitPoints.length === 0) {
					return;
				}

				const bounds = fitPoints.reduce(
					(acc, point) => acc.extend(point),
					new maplibregl.LngLatBounds(fitPoints[0], fitPoints[0]),
				) as {
					getSouthWest: () => { lng: number; lat: number };
					getNorthEast: () => { lng: number; lat: number };
				};

				const southWest = bounds.getSouthWest();
				const northEast = bounds.getNorthEast();
				if (
					southWest.lng === northEast.lng &&
					southWest.lat === northEast.lat
				) {
					map.jumpTo({
						center: [southWest.lng, southWest.lat],
						zoom: defaults.zoom,
					});
					return;
				}

				map.fitBounds(bounds as never, {
					padding: config.fitPadding,
					duration: 0,
				});
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unable to render map data.";
				renderError(`Map Error: ${message}`);
				cleanupExistingInstance();
			}
		});
	}

	loadMapLibre()
		.then((maplibregl) => initMap(maplibregl as never))
		.catch((error) => {
			const message =
				error instanceof Error ? error.message : "Unable to initialize map.";
			renderError(`Map Error: ${message}`);
		});
}
