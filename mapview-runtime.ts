import {
	DEFAULT_SOURCE_STYLE,
	DEFAULT_ZOOM,
	MAPLIBRE_VERSION,
} from "./mapview-constants.ts";
import type { RenderPayload } from "./mapview-types.ts";

export function createMapScript(payload: RenderPayload, mapId: string): string {
	return `
    (function() {
      const mapId = ${JSON.stringify(mapId)};
      const payload = ${JSON.stringify(payload)};
      const globalKey = "__mapviewMapLibreLoader";
      const mapStoreKey = "__mapviewInstances";
      const popupStyleStoreKey = "__mapviewPopupStyles";
      const cssHref = "https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js";
      const defaultSourceStyle = ${JSON.stringify(DEFAULT_SOURCE_STYLE)};
      const defaultPopupClassName = "mapview-popup-default";

      function loadMapLibre() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-mapview-maplibre="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            link.setAttribute('data-mapview-maplibre', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.maplibregl !== 'undefined') {
            resolve(globalThis.maplibregl);
            return;
          }

          const existingScript = document.querySelector('script[data-mapview-maplibre="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.maplibregl), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load MapLibre GL JS.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = scriptSrc;
          script.setAttribute('data-mapview-maplibre', 'true');
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

      function sanitizeClassSegment(value) {
        return String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      function ensurePopupStyleStore() {
        if (!globalThis[popupStyleStoreKey]) {
          globalThis[popupStyleStoreKey] = {
            element: null,
            rules: {}
          };
        }

        const store = globalThis[popupStyleStoreKey];
        if (!store.element || !store.element.isConnected) {
          const style = document.createElement("style");
          style.setAttribute("data-mapview-popup-styles", "true");
          document.head.appendChild(style);
          store.element = style;
        }

        return store;
      }

      function appendPopupStyleRule(className, popupStyle) {
        if (!className) {
          return;
        }

        const store = ensurePopupStyleStore();
        if (store.rules[className]) {
          return;
        }

        const backgroundColor =
          popupStyle && popupStyle.backgroundColor
            ? popupStyle.backgroundColor
            : "Canvas";
        const textColor =
          popupStyle && popupStyle.textColor
            ? popupStyle.textColor
            : "CanvasText";
        const borderColor =
          popupStyle && popupStyle.borderColor
            ? popupStyle.borderColor
            : backgroundColor;

        store.element.appendChild(
          document.createTextNode(
            ".maplibregl-popup." + className + " .maplibregl-popup-content {" +
              "background:" + backgroundColor + ";" +
              "color:" + textColor + ";" +
              "border:1px solid " + borderColor + ";" +
              "box-shadow:0 10px 28px rgba(0, 0, 0, 0.18);" +
            "}" +
            ".maplibregl-popup." + className + " .maplibregl-popup-close-button {" +
              "color:" + textColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-top." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-top-left." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-top-right." + className + " .maplibregl-popup-tip {" +
              "border-bottom-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom-left." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom-right." + className + " .maplibregl-popup-tip {" +
              "border-top-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-left." + className + " .maplibregl-popup-tip {" +
              "border-right-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-right." + className + " .maplibregl-popup-tip {" +
              "border-left-color:" + backgroundColor + ";" +
            "}"
          )
        );
        store.rules[className] = true;
      }

      function ensureDefaultPopupStyle() {
        appendPopupStyleRule(defaultPopupClassName, {
          backgroundColor: "Canvas",
          textColor: "CanvasText"
        });
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

      function buildMarkerOptions(marker) {
        const options = {};
        if (marker && typeof marker.color === 'string' && marker.color) {
          options.color = marker.color;
        }
        if (marker && typeof marker.scale === 'number') {
          options.scale = marker.scale;
        }
        return options;
      }

      function buildPopupClassName(marker, popupKey) {
        ensureDefaultPopupStyle();

        const classNames = [defaultPopupClassName];
        if (marker && typeof marker.popupClassName === "string" && marker.popupClassName) {
          classNames.push(marker.popupClassName);
        }

        if (
          marker &&
          (marker.popupBackgroundColor || marker.popupTextColor || marker.popupBorderColor)
        ) {
          const generatedClassName = "mapview-popup-" + sanitizeClassSegment(popupKey);
          appendPopupStyleRule(generatedClassName, {
            backgroundColor: marker.popupBackgroundColor,
            textColor: marker.popupTextColor,
            borderColor: marker.popupBorderColor
          });
          classNames.push(generatedClassName);
        }

        return classNames.join(" ");
      }

      function buildPopupOptions(marker, popupClassName) {
        const options = {
          offset: 25,
          className: popupClassName
        };

        if (marker && typeof marker.popupMaxWidth === "string" && marker.popupMaxWidth) {
          options.maxWidth = marker.popupMaxWidth;
        }

        return options;
      }

      function addMarker(maplibregl, map, markers, fitPoints, markerStore, markerGroupKey) {
        markers.forEach((marker, index) => {
          const instance = new maplibregl.Marker(buildMarkerOptions(marker))
            .setLngLat(toLngLat(marker.lat, marker.lon));

          if (marker.popup || marker.label) {
            const popupClassName = buildPopupClassName(
              marker,
              markerGroupKey + "-" + index
            );
            instance.setPopup(
              new maplibregl.Popup(buildPopupOptions(marker, popupClassName))
                .setText(String(marker.popup || marker.label))
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

          new maplibregl.Popup({
            offset: 12,
            className: buildPopupClassName(null, layerId)
          })
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

      function resolvedSourceStyle(style) {
        return {
          lineColor: style && style.lineColor ? style.lineColor : defaultSourceStyle.lineColor,
          lineWidth: style && typeof style.lineWidth === 'number' ? style.lineWidth : defaultSourceStyle.lineWidth,
          lineOpacity: style && typeof style.lineOpacity === 'number' ? style.lineOpacity : defaultSourceStyle.lineOpacity,
          fillColor: style && style.fillColor ? style.fillColor : defaultSourceStyle.fillColor,
          fillOpacity: style && typeof style.fillOpacity === 'number' ? style.fillOpacity : defaultSourceStyle.fillOpacity,
          pointColor: style && style.pointColor ? style.pointColor : defaultSourceStyle.pointColor,
          pointRadius: style && typeof style.pointRadius === 'number' ? style.pointRadius : defaultSourceStyle.pointRadius
        };
      }

      function addGeoJsonLayers(maplibregl, map, sourceId, data, layerPrefix, fitPoints, style) {
        const coordinates = collectGeoJsonLngLats(data);
        if (coordinates.length === 0) {
          throw new Error('GeoJSON Error: No renderable features found.');
        }

        const resolvedStyle = resolvedSourceStyle(style);

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
            'fill-color': resolvedStyle.fillColor,
            'fill-opacity': resolvedStyle.fillOpacity
          }
        });

        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': resolvedStyle.lineColor,
            'line-width': resolvedStyle.lineWidth,
            'line-opacity': resolvedStyle.lineOpacity
          }
        });

        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': resolvedStyle.pointRadius,
            'circle-color': resolvedStyle.pointColor,
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
        ensureDefaultPopupStyle();

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

            payload.sourceData.forEach((sourceData, index) => {
              if (sourceData.kind === 'gpx') {
                if (sourceData.trackGeoJson) {
                  addGeoJsonLayers(
                    maplibregl,
                    map,
                    mapId + '-gpx-source-' + index,
                    sourceData.trackGeoJson,
                    mapId + '-gpx-' + index,
                    fitPoints,
                    sourceData.style
                  );
                }

                addMarker(
                  maplibregl,
                  map,
                  sourceData.markers,
                  fitPoints,
                  markerStore,
                  mapId + '-gpx-' + index
                );
                return;
              }

              addGeoJsonLayers(
                maplibregl,
                map,
                mapId + '-geojson-source-' + index,
                sourceData.data,
                mapId + '-geojson-' + index,
                fitPoints,
                sourceData.style
              );
            });

            addMarker(
              maplibregl,
              map,
              config.markers,
              fitPoints,
              markerStore,
              mapId + '-manual'
            );

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
