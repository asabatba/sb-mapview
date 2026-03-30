type ViewConfig = {
	autoFit?: boolean;
	center?: [number, number];
	fitPadding?: number;
	zoom?: number;
};

export function createViewHelpers() {
	function toLngLat(lat: number, lon: number): [number, number] {
		return [lon, lat];
	}

	function resolveInitialView(config: ViewConfig): {
		hasExplicitCenter: boolean;
		initialCenter: [number, number];
		initialZoom: number;
	} {
		const hasExplicitCenter = Array.isArray(config.center);
		const center = hasExplicitCenter ? config.center : undefined;
		return {
			hasExplicitCenter,
			initialCenter: center ? toLngLat(center[0], center[1]) : [0, 0],
			initialZoom:
				hasExplicitCenter && typeof config.zoom === "number" ? config.zoom : 1,
		};
	}

	function isSinglePoint(points: [number, number][]): boolean {
		const firstPoint = points[0];
		if (!firstPoint) {
			return false;
		}

		return points.every(
			(point) => point[0] === firstPoint[0] && point[1] === firstPoint[1],
		);
	}

	function resolveFitAction(
		config: ViewConfig,
		fitPoints: [number, number][],
		defaultZoom: number,
	):
		| { kind: "noop" }
		| { kind: "jumpTo"; center: [number, number]; zoom: number }
		| { kind: "fitBounds"; padding: number } {
		if (Array.isArray(config.center)) {
			return {
				kind: "jumpTo",
				center: toLngLat(config.center[0], config.center[1]),
				zoom: typeof config.zoom === "number" ? config.zoom : defaultZoom,
			};
		}

		if (!config.autoFit || fitPoints.length === 0) {
			return { kind: "noop" };
		}

		if (isSinglePoint(fitPoints)) {
			const point = fitPoints[0];
			if (!point) {
				return { kind: "noop" };
			}
			return {
				kind: "jumpTo",
				center: point,
				zoom: defaultZoom,
			};
		}

		return {
			kind: "fitBounds",
			padding: typeof config.fitPadding === "number" ? config.fitPadding : 40,
		};
	}

	return {
		resolveFitAction,
		resolveInitialView,
		toLngLat,
	};
}
