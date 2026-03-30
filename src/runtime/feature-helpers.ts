export function createFeatureHelpers() {
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

		input.forEach((item) => {
			collectLngLatCoordinates(item, bucket);
		});
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
						feature,
					);
					return;
				case "Feature":
					feature(typedNode.geometry);
					return;
				case "GeometryCollection":
					(Array.isArray(typedNode.geometries)
						? typedNode.geometries
						: []
					).forEach((geometry) => {
						feature(geometry);
					});
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

		function feature(node: unknown): void {
			visit(node);
		}

		visit(geojson);
		return points;
	}

	function getFeatureProperties(
		feature: unknown,
	): Record<string, unknown> | null {
		return feature &&
			typeof feature === "object" &&
			"properties" in feature &&
			feature.properties &&
			typeof feature.properties === "object"
			? (feature.properties as Record<string, unknown>)
			: null;
	}

	function stringifyFeatureValue(value: unknown): string | null {
		if (value === undefined || value === null) {
			return null;
		}

		if (typeof value === "string") {
			const trimmed = value.trim();
			return trimmed ? trimmed : null;
		}

		if (
			typeof value === "number" ||
			typeof value === "boolean" ||
			typeof value === "bigint"
		) {
			return String(value);
		}

		try {
			return JSON.stringify(value);
		} catch {
			return null;
		}
	}

	function getFeatureText(
		feature: unknown,
		explicitProperty: string | undefined,
		fallbackProperties: string[],
	): string | null {
		const properties = getFeatureProperties(feature);
		if (!properties) {
			return null;
		}

		const propertyNames = explicitProperty
			? [explicitProperty]
			: fallbackProperties;
		for (const propertyName of propertyNames) {
			const value = stringifyFeatureValue(properties[propertyName]);
			if (value) {
				return value;
			}
		}

		return null;
	}

	function buildLabelTextExpression(labelProperty?: string): unknown[] {
		const fields = labelProperty ? [labelProperty] : ["label", "name", "title"];

		return [
			"to-string",
			["coalesce", ...fields.map((field) => ["get", field]), ""],
		];
	}

	return {
		collectGeoJsonLngLats,
		getFeaturePopupText(
			feature: unknown,
			popupProperty?: string,
		): string | null {
			return getFeatureText(feature, popupProperty, [
				"popup",
				"description",
				"name",
				"title",
				"label",
			]);
		},
		getFeatureLabelText(
			feature: unknown,
			labelProperty?: string,
		): string | null {
			return getFeatureText(feature, labelProperty, ["label", "name", "title"]);
		},
		buildLabelTextExpression,
	};
}
