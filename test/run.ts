import assert from "node:assert/strict";

import { normalizeConfig, parseWidgetConfig } from "../src/config/config.ts";
import { createMapLibreAssetHelpers } from "../src/runtime/asset-helpers.ts";
import { createFeatureHelpers } from "../src/runtime/feature-helpers.ts";
import { createViewHelpers } from "../src/runtime/view-helpers.ts";
import {
	clearSourceCache,
	loadSourceData,
	parseGeoJson,
	parseGpxContent,
	readSourceFile,
} from "../src/sources/index.ts";
import type { FileLayerConfig } from "../src/shared/types.ts";

type TestCase = {
	name: string;
	run: () => void | Promise<void>;
};

function encodeText(value: string): Uint8Array {
	return new TextEncoder().encode(value);
}

function buildFileLayer(
	path: string,
	overrides: Partial<FileLayerConfig> = {},
): FileLayerConfig {
	return {
		kind: "file",
		path,
		style: {},
		visible: true,
		showLabels: false,
		showDirection: true,
		sourceCacheTtlMs: 0,
		...overrides,
	};
}

const tests: TestCase[] = [
	{
		name: "config parser rejects non-object content",
		run: () => {
			assert.throws(
				() => parseWidgetConfig("source: /track.gpx"),
				/map config must be a json object/i,
			);
		},
	},
	{
		name: "config normalization keeps legacy source and markers compatibility",
		run: () => {
			const config = normalizeConfig(
				parseWidgetConfig(`{
					"sourceStyle": { "lineWidth": 5 },
					"markerStyle": { "color": "#7c3aed" },
					"source": [
						"/tracks/day-1.gpx",
						{ "path": "/tracks/day-2.gpx", "style": { "lineColor": "#0f766e" } }
					],
					"markers": [
						{ "lat": 41.1, "lon": 2.1, "popup": "A" }
					]
				}`),
			);

			assert.equal(config.layers.length, 3);
			assert.equal(config.layers[0]?.kind, "file");
			assert.equal(config.layers[1]?.kind, "file");
			assert.equal(config.layers[2]?.kind, "markers");
			assert.equal(config.layers[0]?.style.lineWidth, 5);
			assert.equal(config.layers[2]?.style.color, "#7c3aed");
		},
	},
	{
		name: "config normalization supports additive layer model",
		run: () => {
			const config = normalizeConfig(
				parseWidgetConfig(`{
					"sourceCacheTtlMs": 2500,
					"maplibreAssetBaseUrl": "https://cdn.example.com/maplibre",
					"layers": [
						{
							"id": "cities",
							"path": "/maps/cities.geojson",
							"popupProperty": "description",
							"labelProperty": "name",
							"showLabels": true,
							"sourceCacheTtlMs": 5000
						},
						{
							"kind": "markers",
							"markers": [
								{ "lat": 41.2, "lon": 2.2, "label": "B" }
							]
						}
					]
				}`),
			);

			assert.equal(config.layers.length, 2);
			assert.equal(
				config.maplibreAssetBaseUrl,
				"https://cdn.example.com/maplibre",
			);
			assert.equal(config.sourceCacheTtlMs, 2500);

			const fileLayer = config.layers[0];
			assert.equal(fileLayer?.kind, "file");
			if (fileLayer?.kind === "file") {
				assert.equal(fileLayer.id, "cities");
				assert.equal(fileLayer.popupProperty, "description");
				assert.equal(fileLayer.labelProperty, "name");
				assert.equal(fileLayer.showLabels, true);
				assert.equal(fileLayer.sourceCacheTtlMs, 5000);
			}
		},
	},
	{
		name: "config normalization parses center zoom and autoFit fields",
		run: () => {
			const config = normalizeConfig(
				parseWidgetConfig(`{
					"center": [41.3874, 2.1686],
					"zoom": 11,
					"autoFit": false
				}`),
			);

			assert.deepEqual(config.center, [41.3874, 2.1686]);
			assert.equal(config.zoom, 11);
			assert.equal(config.autoFit, false);
		},
	},
	{
		name: "config normalization rejects invalid marker layers",
		run: () => {
			assert.throws(
				() =>
					normalizeConfig(
						parseWidgetConfig(`{
							"layers": [
								{ "kind": "markers", "markers": "broken" }
							]
						}`),
					),
				/markers.*must be an array/i,
			);
		},
	},
	{
		name: "GPX parsing extracts tracks and waypoints",
		run: () => {
			const parsed = parseGpxContent(
				`<gpx>
					<trk><trkseg>
						<trkpt lat="41.1" lon="2.1"></trkpt>
						<trkpt lat="41.2" lon="2.2"></trkpt>
					</trkseg></trk>
					<wpt lat="41.3" lon="2.3"><name>Lookout</name></wpt>
				</gpx>`,
				"#0f766e",
			);

			assert.ok(parsed);
			assert.equal(parsed?.trackSegments.length, 1);
			assert.deepEqual(parsed?.trackSegments[0], [
				[41.1, 2.1],
				[41.2, 2.2],
			]);
			assert.equal(parsed?.waypoints[0]?.popup, "Lookout");
			assert.equal(parsed?.waypoints[0]?.color, "#0f766e");
		},
	},
	{
		name: "GeoJSON parsing rejects invalid JSON",
		run: () => {
			assert.throws(
				() => parseGeoJson("{", "/maps/city.geojson"),
				/invalid json/i,
			);
		},
	},
	{
		name: "source loader reads waypoint-only GPX",
		run: async () => {
			const source = await loadSourceData(
				buildFileLayer("/hikes/waypoints.gpx"),
				{
					readFile: async () =>
						encodeText(
							`<gpx><wpt lat="41.4" lon="2.4"><name>Camp</name></wpt></gpx>`,
						),
				},
			);

			assert.equal(source.kind, "gpx");
			assert.equal(source.markers[0]?.popup, "Camp");
			assert.equal(source.trackGeoJson, undefined);
		},
	},
	{
		name: "source loader reads GeoJSON and rejects unsupported extensions",
		run: async () => {
			const geojson = await loadSourceData(
				buildFileLayer("/maps/city.geojson"),
				{
					readFile: async () =>
						encodeText(
							JSON.stringify({
								type: "FeatureCollection",
								features: [
									{
										type: "Feature",
										properties: { name: "Barcelona" },
										geometry: {
											type: "Point",
											coordinates: [2.1686, 41.3874],
										},
									},
								],
							}),
						),
				},
			);

			assert.equal(geojson.kind, "geojson");

			await assert.rejects(
				() =>
					loadSourceData(buildFileLayer("/maps/city.txt"), {
						readFile: async () => encodeText("hello"),
					}),
				/unsupported file type/i,
			);
		},
	},
	{
		name: "source reader honors cache ttl and resolves slash-prefixed candidates",
		run: async () => {
			clearSourceCache();
			let reads = 0;
			const readFile = async (path: string) => {
				reads += 1;
				if (path === "/maps/cached.geojson") {
					throw new Error("not found");
				}
				return encodeText(`content-${reads}`);
			};

			const first = await readSourceFile("/maps/cached.geojson", {
				cacheTtlMs: 5_000,
				readFile,
			});
			const second = await readSourceFile("/maps/cached.geojson", {
				cacheTtlMs: 5_000,
				readFile,
			});

			assert.equal(first, "content-2");
			assert.equal(second, "content-2");
			assert.equal(reads, 2);
		},
	},
	{
		name: "source reader reports missing files",
		run: async () => {
			await assert.rejects(
				() =>
					readSourceFile("/missing/file.geojson", {
						readFile: async () => {
							throw new Error("missing");
						},
					}),
				/file not found/i,
			);
		},
	},
	{
		name: "view helpers honor explicit center and single-point autofit",
		run: () => {
			const helpers = createViewHelpers();

			assert.deepEqual(
				helpers.resolveInitialView({
					center: [41.3874, 2.1686],
					zoom: 9,
				}),
				{
					hasExplicitCenter: true,
					initialCenter: [2.1686, 41.3874],
					initialZoom: 9,
				},
			);

			assert.deepEqual(
				helpers.resolveFitAction({ autoFit: true }, [[2.1686, 41.3874]], 13),
				{
					kind: "jumpTo",
					center: [2.1686, 41.3874],
					zoom: 13,
				},
			);
		},
	},
	{
		name: "feature helpers derive popup text and label expressions",
		run: () => {
			const helpers = createFeatureHelpers();
			const feature = {
				type: "Feature",
				properties: {
					name: "Barcelona",
					description: "Capital-ish",
				},
				geometry: { type: "Point", coordinates: [2.1686, 41.3874] },
			};

			assert.equal(helpers.getFeaturePopupText(feature), "Capital-ish");
			assert.equal(helpers.getFeaturePopupText(feature, "name"), "Barcelona");
			assert.deepEqual(helpers.buildLabelTextExpression("name"), [
				"to-string",
				["coalesce", ["get", "name"], ""],
			]);
		},
	},
	{
		name: "feature helpers collect coordinates across GeoJSON structures",
		run: () => {
			const helpers = createFeatureHelpers();
			const coordinates = helpers.collectGeoJsonLngLats({
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: [
								[2.1, 41.1],
								[2.2, 41.2],
							],
						},
					},
				],
			});

			assert.deepEqual(coordinates, [
				[2.1, 41.1],
				[2.2, 41.2],
			]);
		},
	},
	{
		name: "asset helpers build self-hosted URLs and reject incompatible runtime reuse",
		run: () => {
			const helpers = createMapLibreAssetHelpers();

			assert.deepEqual(
				helpers.buildAssetUrls("5.21.1", "https://cdn.example.com/maplibre/"),
				{
					cssHref: "https://cdn.example.com/maplibre/maplibre-gl.css",
					scriptSrc: "https://cdn.example.com/maplibre/maplibre-gl.js",
					assetConfigKey: "5.21.1::https://cdn.example.com/maplibre",
				},
			);

			assert.throws(
				() =>
					helpers.assertCompatibleLoadedRuntime(
						"5.21.1::unpkg",
						"5.21.1::https://cdn.example.com/maplibre",
					),
				/only one maplibre runtime configuration per page/i,
			);
		},
	},
];

async function main(): Promise<void> {
	let passed = 0;

	for (const testCase of tests) {
		try {
			await testCase.run();
			passed += 1;
			console.log(`PASS ${testCase.name}`);
		} catch (error) {
			console.error(`FAIL ${testCase.name}`);
			throw error;
		}
	}

	console.log(`\n${passed}/${tests.length} tests passed`);
}

await main();
